import json
import math
import time
from iotccsdk import CameraClient
from . error_utils import log_unknown_exception, CameraClientError
from . model_utility import ModelUtility
from . constants import SETTING_ON, \
    SETTING_OFF, \
    MINIMUM_MESSAGE_DELAY_IN_SECONDS


MODEL_ZIP_URL_PROP = "ModelZipUrl"
MESSAGE_DELAY_SECS_PROP = "TimeBetweenMessagesInSeconds"
OBJS_OF_INTEREST_PROP = "ObjectsOfInterest"
OVERLAY_STATE_PROP = "ShowVideoOverlay"
OVERLAY_CONFIG_PROP = "VideoOverlayConfig"
BITRATE_PROP = "Bitrate"
RESOLUTION_PROP = "Resolution"
FRAME_RATE_PROP = "FrameRate"
DISPLAY_OUT_PROP = "HdmiDisplayActive"
VIDEO_ANALYTICS_PROP = "VideoAnalyticsEnabled"
PREVIEW_STATE_PROP = "ShowVideoPreview"
CODEC_PROP = "Codec"
VIDEO_RTSP_PROP = "RtspVideoUrl"
DATA_RTSP_PROP = "RtspDataUrl"
SPTD_ENCODING_PROP = "SupportedEncodingTypes"
SPTD_BITRATES_PROP = "SupportedBitrates"
SPTD_FRAME_RATES_PROP = "SupportedFrameRates"
SPTD_RESOLUTIONS_PROP = "SupportedResolutions"
SPTD_CONFIG_OVERLAY_PROP = "SupportedConfigOverlayStyles"

PROPERTY_NAME_MAP = {
    'resolution': RESOLUTION_PROP,
    'codec': CODEC_PROP,
    'bitrate': BITRATE_PROP,
    'display_out': DISPLAY_OUT_PROP,
    'preview_state': PREVIEW_STATE_PROP,
    'analytics_state': VIDEO_ANALYTICS_PROP,
    'overlay_config': OVERLAY_CONFIG_PROP,
    'overlay_state': OVERLAY_STATE_PROP,
    'framerate': FRAME_RATE_PROP,
    'video_rtsp_url': VIDEO_RTSP_PROP,
    'data_rtsp_url': DATA_RTSP_PROP,
    'supported_encoding': SPTD_ENCODING_PROP,
    'supported_bitrates': SPTD_BITRATES_PROP,
    'supported_frame_rates': SPTD_FRAME_RATES_PROP,
    'supported_resolutions': SPTD_RESOLUTIONS_PROP,
    'supported_config_overlay': SPTD_CONFIG_OVERLAY_PROP
}


class CameraProperties:

    def __init__(self):
        print("Init CameraProperties")
        self.bitrate = "1.5Mbps"
        self.codec = "AVC/H.264"
        self.data_rtsp_url = ""
        self.framerate = 30
        self.overlay_config = "inference"
        self.resolution = "1080P"
        self.video_rtsp_url = ""
        self.__analytics_state = SETTING_ON
        self.__display_out = 1
        self.__overlay_state = SETTING_ON
        self.__preview_state = SETTING_ON
        self.__supported_bitrates = ""
        self.__supported_config_overlay = ["text", "inference"]
        self.__supported_encoding = ""
        self.__supported_frame_rates = ""
        self.__supported_resolutions = ""
        self.__config_update_needed = True

    @property
    def analytics_state(self):
        return self.__analytics_state == SETTING_ON

    @analytics_state.setter
    def analytics_state(self, value):
        self.__analytics_state = SETTING_ON if value else SETTING_OFF

    @property
    def display_out(self):
        return self.__display_out == 1

    @display_out.setter
    def display_out(self, value):
        self.__display_out = 1 if value else 0

    @property
    def overlay_state(self):
        return self.__overlay_state == SETTING_ON

    @overlay_state.setter
    def overlay_state(self, value):
        self.__overlay_state = SETTING_ON if value else SETTING_OFF

    @property
    def preview_state(self):
        return self.__preview_state == SETTING_ON

    @preview_state.setter
    def preview_state(self, value):
        self.__preview_state = SETTING_ON if value else SETTING_OFF

    @property
    def supported_encoding(self):
        return self.__list_to_delimited(self.__supported_encoding)

    @property
    def supported_bitrates(self):
        return self.__list_to_delimited(self.__supported_bitrates)

    @property
    def supported_resolutions(self):
        return self.__list_to_delimited(self.__supported_resolutions)

    @property
    def supported_frame_rates(self):
        return self.__list_to_delimited(self.__supported_frame_rates)

    @property
    def supported_config_overlay(self):
        return self.__list_to_delimited(self.__supported_config_overlay)

    def configure_camera_client(self, camera_client: CameraClient, is_model_changed=False):
        if not self.__config_update_needed and not is_model_changed:
            return False

        if camera_client is None:
            raise ValueError("camera_client is None")

        print("Configuring camera_client")

        self.__turn_camera_off(camera_client)

        self.__configure_preview(camera_client)

        if self.preview_state:
            # set overlay config then turn it on/off
            print("configure_overlay: %s" % self.overlay_config)
            camera_client.configure_overlay(self.overlay_config)
            print("configure_overlay_state: %s" % self.__overlay_state)
            camera_client.set_overlay_state(self.__overlay_state)

        # TODO: it seems that analytics can't restart unless preview is bounced
        # need to handle that case
        print("set_analytics_state: %s" % self.__analytics_state)
        if not camera_client.set_analytics_state(self.__analytics_state):
            print("Failed to set vam_running state to: %s" %
                  self.analytics_state)
            raise CameraClientError(
                "VAM failed to start in configure_camera_client")

        # update properties from the camera
        self.update_camera_properties(camera_client)

        return True

    def get_reported_properties(self):
        props = list()
        self.__add_class_fields(props)
        self.__add_class_properties(props)
        return props

    def handle_twin_update(self, data):
        self.__config_update_needed = False
        self.__set_needs_update(self.__update_analytics_state(data))
        self.__set_needs_update(self.__update_bitrate(data))
        self.__set_needs_update(self.__update_codec(data))
        self.__set_needs_update(self.__update_display_out(data))
        self.__set_needs_update(self.__update_frame_rate(data))
        self.__set_needs_update(self.__update_overlay_config(data))
        self.__set_needs_update(self.__update_overlay_state(data))
        self.__set_needs_update(self.__update_preview_state(data))
        self.__set_needs_update(self.__update_resolution(data))

    def __set_needs_update(self, is_changed):
        self.__config_update_needed = self.__config_update_needed or is_changed

    def update_camera_properties(self, camera_client: CameraClient):
        self.video_rtsp_url = camera_client.preview_url
        self.data_rtsp_url = camera_client.vam_url
        self.bitrate = camera_client.cur_bitrate
        self.codec = camera_client.cur_codec
        self.framerate = camera_client.cur_framerate
        self.resolution = camera_client.cur_resolution
        self.__display_out = camera_client.display_out
        self.__supported_encoding = camera_client.encodetype
        self.__supported_resolutions = camera_client.resolutions
        self.__supported_bitrates = camera_client.bitrates
        self.__supported_frame_rates = camera_client.framerates
        self.analytics_state = camera_client.vam_running

    # adds public fields to list of property objects as key value pairs
    def __add_class_fields(self, props):
        for k, v in self.__dict__.items():
            # skip private fields
            if "__" in k:
                continue
            if type(v) is list:
                # format as stringified json
                v = json.dumps(v)
            if k in PROPERTY_NAME_MAP:
                props.append({PROPERTY_NAME_MAP[k]: v})
            else:
                props.append({k: v})

    # find all properties in the class and add to list as key value pairs
    def __add_class_properties(self, props):
        property_names = [p for p in dir(CameraProperties) if isinstance(
            getattr(CameraProperties, p), property)]
        for prop_name in property_names:
            prop_val = self.__getattribute__(prop_name)
            if prop_name in PROPERTY_NAME_MAP:
                props.append({PROPERTY_NAME_MAP[prop_name]: prop_val})
            else:
                props.append({prop_name: prop_val})

    # turn off preview, overlay and analytics
    def __turn_camera_off(self, camera_client: CameraClient):
        camera_client.set_overlay_state(SETTING_OFF)
        count = 0
        print("Turning analytics off")
        while camera_client.vam_running and count < 5:
            print("Retrying analytics off: %s" % count)
            camera_client.set_analytics_state(SETTING_OFF)
            count += 1
            time.sleep(1)

    def __configure_preview(self, camera_client: CameraClient):
        if (camera_client.cur_resolution == self.resolution
                and camera_client.cur_codec == self.codec
                and camera_client.cur_bitrate == self.bitrate
                and camera_client.cur_framerate == self.framerate
                and camera_client.display_out == self.__display_out
                and camera_client.preview_running == self.preview_state):
            return

        count = 0
        print("Turning preview off")
        if not camera_client.set_preview_state(SETTING_OFF):
            raise CameraClientError("Failed to stop preview")
        while camera_client.preview_running and count < 5:
            print("Waiting for preview to stop: %s" % count)
            count += 1
            time.sleep(1)

        print(
            "Configure preview (%s, %s, %s, %s, %s)" %
            (self.resolution,
             self.codec,
             self.bitrate,
             self.framerate,
             self.__display_out))

        camera_client.configure_preview(
            resolution=self.resolution,
            encode=self.codec,
            bitrate=self.bitrate,
            framerate=self.framerate,
            display_out=self.__display_out)

        print("set preview state: %s" % self.__preview_state)
        if not camera_client.set_preview_state(self.__preview_state):
            raise CameraClientError(
                ("failed to set the preview state to %s"
                    % self.__preview_state))

    def __has_preview_changed(self, camera_client: CameraClient):
        return (camera_client.cur_resolution != self.resolution
                or camera_client.cur_codec != self.codec
                or camera_client.cur_bitrate != self.bitrate
                or camera_client.cur_framerate != self.framerate
                or camera_client.display_out != self.__display_out)

    # update property and return bool to indicate if changed
    def __update_analytics_state(self, data):
        new_value = Properties.get_twin_property(data, VIDEO_ANALYTICS_PROP)
        if new_value is None or new_value is self.analytics_state:
            return False
        self.analytics_state = new_value
        return True

    # update property and return bool to indicate if changed
    def __update_bitrate(self, data):
        new_value = Properties.get_twin_property(data, BITRATE_PROP)
        if new_value is None or self.bitrate == new_value:
            return False
        self.bitrate = new_value
        return True

    # update property and return bool to indicate if changed
    def __update_codec(self, data):
        new_value = Properties.get_twin_property(data, CODEC_PROP)
        if new_value is None or new_value == self.codec:
            return False
        self.codec = new_value
        return True

    # update property and return bool to indicate if changed
    def __update_display_out(self, data):
        new_value = Properties.get_twin_property(data, DISPLAY_OUT_PROP)
        if (new_value is None or new_value is self.display_out):
            return False
        self.display_out = new_value
        return True

    # update property and return bool to indicate if changed
    def __update_frame_rate(self, data):
        new_value = Properties.get_twin_property(data, FRAME_RATE_PROP)
        try:
            if type(new_value) is str:
                new_value = int(new_value)
            if new_value != self.framerate:
                self.framerate = new_value
                return True
        except (TypeError, ValueError):
            print("Received unusable framerate %s" % new_value)
        return False

    # update property and return bool to indicate if changed
    def __update_overlay_config(self, data):
        new_value = Properties.get_twin_property(data, OVERLAY_CONFIG_PROP)
        if new_value is None or new_value == self.overlay_config:
            return False
        self.overlay_config = new_value
        return True

    # update property and return bool to indicate if changed
    def __update_overlay_state(self, data):
        new_value = Properties.get_twin_property(data, OVERLAY_STATE_PROP)
        if new_value is None or new_value == self.overlay_state:
            return False
        self.overlay_state = new_value
        return True

    # update property and return bool to indicate if changed
    def __update_preview_state(self, data):
        new_value = Properties.get_twin_property(data, PREVIEW_STATE_PROP)
        if new_value is None or new_value == self.preview_state:
            return False
        self.preview_state = new_value
        return True

    # update property and return bool to indicate if changed
    def __update_resolution(self, data):
        new_value = Properties.get_twin_property(data, RESOLUTION_PROP)
        if new_value is None or new_value == self.resolution:
            return False
        self.resolution = new_value
        return True

    def __list_to_delimited(self, input_list):
        return ' | '.join(map(str, input_list))


class ModelProperties:
    def __init__(self):
        print("Init ModelProperties")
        self.model_zip_url = ""
        self.message_delay_sec = 6
        self.objects_of_interest = ["All"]
        self.has_model_changed = False

    def is_object_of_interest(self, label):
        # create a filter object to select a string the objects of interest list
        # return true if the resulting list has items otherwise false
        list_filter = list(filter(lambda list_item: (list_item.lower() == label.lower()
                                                     or list_item.lower() == "all"),
                                  self.objects_of_interest))
        return (len(list_filter) > 0)

    def handle_twin_update(self, data):
        self.__handle_model_updates(data)
        self.__update_message_delay(data)
        self.__update_objects_of_interest(data)

    def get_reported_properties(self):
        props = list()
        props.append({MODEL_ZIP_URL_PROP: self.model_zip_url})
        props.append({MESSAGE_DELAY_SECS_PROP: self.message_delay_sec})
        props.append(
            {OBJS_OF_INTEREST_PROP: json.dumps(self.objects_of_interest)})
        return props

    def update_inference_model(self):
        if not self.has_model_changed:
            return False
        try:
            model_util = ModelUtility()
            model_util.replace_model_files(self.model_zip_url)
            self.has_model_changed = False
            return True
        except Exception:
            log_unknown_exception("Could not install new model files")
            return False

    def __handle_model_updates(self, data):
        new_zip_url = Properties.get_twin_property(
            data, MODEL_ZIP_URL_PROP) or self.model_zip_url

        if (self.model_zip_url.lower() != new_zip_url.lower()):
            self.model_zip_url = new_zip_url
            self.has_model_changed = True

    def __update_objects_of_interest(self, data):
        objects_json = Properties.get_twin_property(
            data, OBJS_OF_INTEREST_PROP)
        if objects_json is not None:
            self.objects_of_interest = json.loads(objects_json)

    def __update_message_delay(self, data):
        delay = Properties.get_twin_property(data, MESSAGE_DELAY_SECS_PROP)
        try:
            if type(delay) is not int:
                # convert from str and truncate to int
                delay = math.trunc(float(delay))
            if delay < MINIMUM_MESSAGE_DELAY_IN_SECONDS:
                delay = MINIMUM_MESSAGE_DELAY_IN_SECONDS
        except Exception:
            log_unknown_exception(
                "Message delay must be a number got %s" % delay)
            delay = MINIMUM_MESSAGE_DELAY_IN_SECONDS
        self.message_delay_sec = delay


class Properties:
    def __init__(self):
        print("Init Properties")
        self.camera_properties = CameraProperties()
        self.model_properties = ModelProperties()

    def handle_twin_update(self, payload):
        data = json.loads(payload)
        print("Received twin update: %s" % data)
        self.model_properties.handle_twin_update(data)
        self.camera_properties.handle_twin_update(data)

    def report_properties_to_hub(self, hub_manager):
        if (hub_manager is None):
            raise ValueError("hub_manager is None")

        for prop in self.camera_properties.get_reported_properties():
            self.__report_property(prop, hub_manager)

        for prop in self.model_properties.get_reported_properties():
            self.__report_property(prop, hub_manager)

    def __report_property(self, prop, hub_manager):
        json_prop = json.dumps(prop)
        print("Send prop: %s" % json_prop)
        hub_manager.client.send_reported_state(
            json_prop,
            len(json_prop),
            Properties.send_reported_state_callback,
            json_prop)

    @staticmethod
    def get_twin_property(data, property_name):
        result = None
        DESIRED_PROPERTY = "desired"

        if DESIRED_PROPERTY in data and property_name in data[DESIRED_PROPERTY]:
            result = data[DESIRED_PROPERTY][property_name]

        if property_name in data:
            result = data[property_name]

        if result is None or result == "":
            return None

        return result

    @staticmethod
    def send_reported_state_callback(status_code, user_context):
        print("Confirmation of %d received for %s." %
              (status_code, user_context))
