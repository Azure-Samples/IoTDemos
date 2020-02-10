
# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import sys
if __package__ == '' or __package__ is None:  # noqa
    import os
    parent_dir = os.path.dirname(
        os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(1, parent_dir)
    pkg_name = os.path.split(os.path.dirname(os.path.abspath(__file__)))[-1]
    __import__(pkg_name)
    __package__ = str(pkg_name)
    del os
from . constants import SETTING_OFF
from . error_utils import CameraClientError, log_unknown_exception
from . properties import Properties
from . model_utility import ModelUtility
from . inference import Inference
from . iot_hub_manager import IotHubManager
from iotccsdk import CameraClient
from iothub_client import IoTHubTransportProvider, IoTHubError
import time
import json
import threading

# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
IOT_HUB_PROTOCOL = IoTHubTransportProvider.MQTT

ipc_provider = None
camera_client = None
iot_hub_manager = None
properties = None
model_util = None
last_time = None
no_inference_interval = 5


def create_camera(ip_address=None, username="admin", password="admin"):
    if ip_address is None:
        ip_address = model_util.getWlanIp()

    print("ip address = %s" % ip_address)
    if ipc_provider is None:
        print("Create camera with no ipc_provider")
        return CameraClient.connect(
            ip_address=ip_address,
            username=username,
            password=password)

    print("Create camera with ipc_provider %s" % ipc_provider)
    return CameraClient.connect(
        ipc_provider=ipc_provider,
        ip_address=ip_address,
        username=username,
        password=password)


def print_inference(hub_manager=None, last_sent_time=time.time(), result=None):
    global properties
    if time.time() - last_sent_time <= properties.model_properties.message_delay_sec:
        return last_sent_time

    state = { "message_type": "summary", "PersonNoPPE": 0, "PersonHardHat": 0 , "PersonSafetyVest" : 0 }
    if result is not None:
        for inf_obj in result.objects:
            print("Found result object")
            inference = Inference(inf_obj)
            if (properties.model_properties.is_object_of_interest(inference.label)):
                count = state[inference.label] if inference.label in state else 0
                state[inference.label] = count + 1

                json_message = inference.to_json()
                iot_hub_manager.send_message_to_upstream(json_message)
                print(json_message)

    json_message = json.dumps(state)
    print(json_message)
    iot_hub_manager.send_message_to_upstream(json_message)
    last_sent_time = time.time()

    return last_sent_time

def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()
    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t

def check_no_inference():
    global last_time
    global iot_hub_manager
    if time.time() - last_time >= no_inference_interval:
        last_time = print_inference(iot_hub_manager, last_time)

def main(protocol):
    global ipc_provider
    global camera_client
    global iot_hub_manager
    global properties
    global model_util
    global last_time

    print("Create model_util")
    model_util = ModelUtility()

    print("Create properties")
    properties = Properties()
    camera_props = properties.camera_properties

    # push model
    model_util.transfer_dlc(True)

    print("\nPython %s\n" % sys.version)
    last_time = time.time()

    # setup interval to look for no inference found after X seconds
    set_interval(check_no_inference, no_inference_interval)

    while True:
        with create_camera() as camera_client:
            try:
                ipc_provider = camera_client.ipc_provider
                camera_props.configure_camera_client(camera_client)
                iot_hub_manager = IotHubManager(
                    protocol, camera_client, properties)
                iot_hub_manager.subscribe_to_events()

                while True:
                    try:
                        while camera_client.vam_running:
                            with camera_client.get_inferences() as results:
                                for result in results:
                                    last_time = print_inference(
                                         iot_hub_manager, last_time, result)
                    except EOFError:
                        print("EOFError. Current VAM running state is %s." %
                              camera_client.vam_running)

                    except Exception:
                        log_unknown_exception(
                            "Exception from get inferences", iot_hub_manager)
                        continue
            except CameraClientError as cce:
                print("Received camera error, but will try to continue: %s" % cce)
                if camera_client is not None:
                    status = camera_client.logout()
                    print("Logout with status: %s" % status)
                camera_client = None
                continue
            except IoTHubError as iothub_error:
                print("Unexpected error %s from IoTHub" % iothub_error)
                return
            except KeyboardInterrupt:
                print("IoTHubModuleClient sample stopped")
                return
            finally:
                print("Try to clean up before the end")
                if camera_client is not None:
                    camera_client.set_overlay_state(SETTING_OFF)
                    camera_client.set_analytics_state(SETTING_OFF)
                    camera_client.set_preview_state(SETTING_OFF)
                    status = camera_client.logout()
                    print("Logout with status: %s" % status)


if __name__ == '__main__':
    main(IOT_HUB_PROTOCOL)
