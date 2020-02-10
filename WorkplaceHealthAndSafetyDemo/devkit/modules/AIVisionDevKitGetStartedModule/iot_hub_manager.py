from . constants import SETTING_OFF, \
    SETTING_ON, \
    TURN_CAMERA_ON_METHOD_NAME, \
    TURN_CAMERA_OFF_METHOD_NAME, \
    TO_UPSTREAM_MESSAGE_QUEUE_NAME
from iotccsdk import CameraClient
from iothub_client import IoTHubModuleClient, IoTHubMessage, DeviceMethodReturnValue
from . properties import Properties
from . error_utils import log_unknown_exception


MODULE_TWIN_UPDATE_CONTEXT = 0


# messageTimeout - the maximum time in milliseconds until a message times out.
# The timeout period starts at IoTHubModuleClient.send_event_async.
# By default, messages do not expire.
MESSAGE_TIMEOUT = 10000

# global counters
send_callbacks = 0


class IotHubManager(object):
    def __init__(self, protocol, camera_client: CameraClient, properties: Properties):
        print("Creating IoT Hub manager")
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)
        self.camera_client = camera_client
        self.properties = properties

        # set the time until a message times out
        self.client.set_option("messageTimeout", MESSAGE_TIMEOUT)

    def subscribe_to_events(self):
        print("Subscribing to method calls")
        self.client.set_module_method_callback(self.__method_callback_handler, 0)

        print("Subscribing to module twin updates")
        self.client.set_module_twin_callback(
            self.__module_twin_callback, MODULE_TWIN_UPDATE_CONTEXT)

    # sends a messager to the "ToUpstream" queue to be sent to hub
    def send_message_to_upstream(self, message):
        try:
            message = IoTHubMessage(message)
            self.client.send_event_async(
                TO_UPSTREAM_MESSAGE_QUEUE_NAME,
                message,
                self.__send_confirmation_callback,
                0)
            # logging.info("finished sending message...")
        except Exception as ex:
            print("Exception in send_message_to_upstream: %s" % ex)
            pass

    # Callback received when the message that we're forwarding is processed.
    def __send_confirmation_callback(self, message, result, user_context):
        global send_callbacks
        print("Confirmation[%d] received for message with result = %s" % (
            user_context, result))
        map_properties = message.properties()
        key_value_pair = map_properties.get_internals()
        print("\tProperties: %s" % key_value_pair)
        send_callbacks += 1
        print("\tTotal calls confirmed: %d" % send_callbacks)

    def __method_callback_handler(self, method_name, payload, user_context):
        """
        Private method to handle the callbacks from the IoT Hub by calling the
        callback matching `method_name`
        """
        retval = {
            TURN_CAMERA_ON_METHOD_NAME:
                lambda payload, user_context: self.__turn_camera_on_callback(
                    payload, user_context),
            TURN_CAMERA_OFF_METHOD_NAME:
                lambda payload, user_context: self.__turn_camera_off_callback(
                    payload, user_context)
        }[method_name](payload, user_context)

        return retval

    def __turn_camera_on_callback(self, payload, user_context):
        retval = DeviceMethodReturnValue()
        try:
            self.camera_client.set_preview_state(SETTING_ON)
            # TODO: restart analytics
            retval.status = 200
            retval.response = "{\"Response\":\"Successfully started camera\"}"
            return retval
        except Exception:
            retval.status = 500
            retval.response = "{\"Response\":\"Failed to start camera\"}"
            return retval

    def __turn_camera_off_callback(self, payload, user_context):
        retval = DeviceMethodReturnValue()
        try:
            self.camera_client.set_overlay_state(SETTING_OFF)
            self.camera_client.set_analytics_state(SETTING_OFF)
            self.camera_client.set_preview_state(SETTING_OFF)
            retval.status = 200
            retval.response = "{\"Response\":\"Successfully stopped camera\"}"
            return retval
        except Exception:
            retval.status = 500
            retval.response = "{\"Response\":\"Failed to stop camera\"}"
            return retval

    def __module_twin_callback(self, update_state, payload, user_context):
        print("Received twin callback")
        self.properties.handle_twin_update(payload)
        self.__update_model_and_config()

    def __update_model_and_config(self):
        model_props = self.properties.model_properties
        camera_props = self.properties.camera_properties
        if not self.camera_client:
            print("Handle updates aborting")
            print("\tcamera_client is %s" % self.camera_client)
            return
        try:
            is_model_changed = model_props.update_inference_model()
            camera_props.configure_camera_client(self.camera_client, is_model_changed)
            self.properties.report_properties_to_hub(self)
        except Exception as ex:
            log_unknown_exception(
                "Error raised while handling update callback: %s" % ex,
                self)
            raise ex
