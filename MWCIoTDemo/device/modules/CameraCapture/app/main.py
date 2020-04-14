# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import os
import random
import sys
import time
import json
import urllib.parse
import iothub_client
# pylint: disable=E0611
# Disabling linting that is not supported by Pylint for C extensions such as iothub_client. See issue https://github.com/PyCQA/pylint/issues/1955
from iothub_client import (IoTHubModuleClient, IoTHubClientError, IoTHubError,
                           IoTHubMessage, IoTHubMessageDispositionResult,
                           IoTHubTransportProvider)

import CameraCapture
from CameraCapture import CameraCapture


# global counters
SEND_CALLBACKS = 0
twin_flag = True
video_path = None
storage_account_name = None
storage_account_key = None


def send_to_Hub_callback(strMessage):
    message = IoTHubMessage(bytearray(strMessage, 'utf8'))
    hubManager.send_event_to_output("output1", message, 0)

# Callback received when the message that we're forwarding is processed.


def send_confirmation_callback(message, result, user_context):
    global SEND_CALLBACKS
    SEND_CALLBACKS += 1


class HubManager(object):

    def __init__(
            self,
            messageTimeout,
            protocol,
            verbose):
        '''
        Communicate with the Edge Hub

        :param int messageTimeout: the maximum time in milliseconds until a message times out. The timeout period starts at IoTHubClient.send_event_async. By default, messages do not expire.
        :param IoTHubTransportProvider protocol: Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
        :param bool verbose: set to true to get detailed logs on messages
        '''
        self.TWIN_CONTEXT = 0 

        self.messageTimeout = messageTimeout
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)
        self.client.set_option("messageTimeout", self.messageTimeout)
        self.client.set_option("product_info", "edge-camera-capture")
        self.client.set_module_twin_callback(device_twin_callback, 0)
        if verbose:
            self.client.set_option("logtrace", 1)  # enables MQTT logging

    def send_event_to_output(self, outputQueueName, event, send_context):
        self.client.send_event_async(
            outputQueueName, event, send_confirmation_callback, send_context)

def device_twin_callback(update_state, payload, user_context):

    global video_path 
    global storage_account_name 
    global storage_account_key 
    global twin_flag

    print ( "" )
    print ( "Twin callback called with:" )
    print ( "    updateStatus: %s" % update_state )
    print ( "    payload: %s" % payload )

    data = json.loads(payload)

    desired = data["desired"]
    video_path = desired["VideoPath"]
    storage_account_name = desired["StorageAccountName"]
    storage_account_key = urllib.parse.quote(desired["StorageAccountKey"])

    twin_flag = False


def main(
        imageProcessingEndpoint="",
        imageProcessingParams="",
        showVideo=False,
        verbose=False,
        loopVideo=True,
        convertToGray=False,
        resizeWidth=0,
        resizeHeight=0,
        annotate=False
):
    '''
    Capture a camera feed, send it to processing and forward outputs to EdgeHub

    :param int videoPath: camera device path such as /dev/video0 or a test video file such as /TestAssets/myvideo.avi. Mandatory.
    :param str imageProcessingEndpoint: service endpoint to send the frames to for processing. Example: "http://face-detect-service:8080". Leave empty when no external processing is needed (Default). Optional.
    :param str imageProcessingParams: query parameters to send to the processing service. Example: "'returnLabels': 'true'". Empty by default. Optional.
    :param bool showVideo: show the video in a windows. False by default. Optional.
    :param bool verbose: show detailed logs and perf timers. False by default. Optional.
    :param bool loopVideo: when reading from a video file, it will loop this video. True by default. Optional.
    :param bool convertToGray: convert to gray before sending to external service for processing. False by default. Optional.
    :param int resizeWidth: resize frame width before sending to external service for processing. Does not resize by default (0). Optional.
    :param int resizeHeight: resize frame width before sending to external service for processing. Does not resize by default (0). Optional.ion(
    :param bool annotate: when showing the video in a window, it will annotate the frames with rectangles given by the image processing service. False by default. Optional. Rectangles should be passed in a json blob with a key containing the string rectangle, and a top left corner + bottom right corner or top left corner with width and height.
    '''
    try:
        print("\nPython %s\n" % sys.version)
        print("Camera Capture Azure IoT Edge Module. Press Ctrl-C to exit.")
        try:
            global hubManager
            global twin_flag
            hubManager = HubManager(
                10000, IoTHubTransportProvider.MQTT, verbose)
            
            print("waiting for twin props")
            while twin_flag:
                time.sleep(1)
                pass

        except IoTHubError as iothub_error:
            print("Unexpected error %s from IoTHub" % iothub_error)
            return
        with CameraCapture(video_path, storage_account_name, storage_account_key, imageProcessingEndpoint, imageProcessingParams, showVideo, verbose, loopVideo, convertToGray, resizeWidth, resizeHeight, annotate, send_to_Hub_callback) as cameraCapture:
            cameraCapture.start()
    except KeyboardInterrupt:
        print("Camera capture module stopped")


def __convertStringToBool(env):
    if env in ['True', 'TRUE', '1', 'y', 'YES', 'Y', 'Yes']:
        return True
    elif env in ['False', 'FALSE', '0', 'n', 'NO', 'N', 'No']:
        return False
    else:
        raise ValueError('Could not convert string to bool.')


if __name__ == '__main__':
    try:
        IMAGE_PROCESSING_ENDPOINT = os.getenv('IMAGE_PROCESSING_ENDPOINT', "")
        IMAGE_PROCESSING_PARAMS = os.getenv('IMAGE_PROCESSING_PARAMS', "")
        SHOW_VIDEO = __convertStringToBool(os.getenv('SHOW_VIDEO', 'False'))
        VERBOSE = __convertStringToBool(os.getenv('VERBOSE', 'False'))
        LOOP_VIDEO = __convertStringToBool(os.getenv('LOOP_VIDEO', 'True'))
        CONVERT_TO_GRAY = __convertStringToBool(
            os.getenv('CONVERT_TO_GRAY', 'False'))
        RESIZE_WIDTH = int(os.getenv('RESIZE_WIDTH', 0))
        RESIZE_HEIGHT = int(os.getenv('RESIZE_HEIGHT', 0))
        ANNOTATE = __convertStringToBool(os.getenv('ANNOTATE', 'False'))

    except ValueError as error:
        print(error)
        sys.exit(1)

    main(IMAGE_PROCESSING_ENDPOINT, IMAGE_PROCESSING_PARAMS, SHOW_VIDEO,
         VERBOSE, LOOP_VIDEO, CONVERT_TO_GRAY, RESIZE_WIDTH, RESIZE_HEIGHT, ANNOTATE)
