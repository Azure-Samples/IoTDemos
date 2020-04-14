
from urllib.request import urlopen
from datetime import datetime
from operator import itemgetter

import tensorflow as tf
from PIL import Image, ImageDraw
from object_detection import ObjectDetection
from azure.storage.blob import BlobServiceClient, BlobClient
import numpy as np
import sys
import uuid
import io
import time


MODEL_FILENAME = 'model.pb'
LABELS_FILENAME = 'labels.txt'
CONTAINER_NAME = "forkliftimages"

od_model = None
last_upload_time = None
latest_blob_image = ''
send_to_blob_interval = 5
labels = []

class TFObjectDetection(ObjectDetection):
    """Object Detection class for TensorFlow"""

    def __init__(self, graph_def, labels):
        super(TFObjectDetection, self).__init__(labels)
        self.graph = tf.compat.v1.Graph()
        with self.graph.as_default():
            input_data = tf.compat.v1.placeholder(tf.float32, [1, None, None, 3], name='Placeholder')
            tf.import_graph_def(graph_def, input_map={"Placeholder:0": input_data}, name="")

    def predict(self, preprocessed_image):
        inputs = np.array(preprocessed_image, dtype=np.float)[:, :, (2, 1, 0)]  # RGB -> BGR

        with tf.compat.v1.Session(graph=self.graph) as sess:
            output_tensor = sess.graph.get_tensor_by_name('model_outputs:0')
            outputs = sess.run(output_tensor, {'Placeholder:0': inputs[np.newaxis, ...]})
            return outputs[0]

def initialize():
    global od_model

    # Load a TensorFlow model
    graph_def = tf.compat.v1.GraphDef()
    with tf.io.gfile.GFile(MODEL_FILENAME, 'rb') as f:
        graph_def.ParseFromString(f.read())

    # Load labels
    with open(LABELS_FILENAME, 'r') as f:
        labels = [l.strip() for l in f.readlines()]

    od_model = TFObjectDetection(graph_def, labels)
   
          
def predict_image(image, blob_service_client):
    global last_upload_time
    global latest_blob_image
    try:
        if image.mode != "RGB":
            print("Converting to RGB")
            image = image.convert("RGB")

        predictions = od_model.predict_image(image)

        response = { 'created': datetime.utcnow().isoformat(), 'forklift': 0, 'bloburl' : latest_blob_image }
       
        if predictions:
            highest_prediction = max(predictions, key=itemgetter('probability'))
            print(highest_prediction)
            if highest_prediction['probability'] > 0.6:
                response['forklift'] = 1
                if last_upload_time is None or time.time() - last_upload_time >= send_to_blob_interval:

                    bounding_box = highest_prediction['boundingBox']

                    x0 = image.width * bounding_box['left']
                    y0 = image.height * bounding_box['top']
                    x1 = image.width * (bounding_box['left'] + bounding_box['width'])
                    y1 = image.height * (bounding_box['top'] + bounding_box['height'])

                    draw = ImageDraw.Draw(image)
                    draw.rectangle(((x0, y0), (x1, y1)), outline="red", width=3)

                    stream = io.BytesIO()
                    image.save(stream, format='PNG')
                    img_byte_array = stream.getvalue()

                    file_name = str(uuid.uuid4()) + ".png"
                    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=file_name)
                    blob_client.upload_blob(img_byte_array)

                    last_upload_time = time.time()
                    latest_blob_image = blob_client.url

                    response['bloburl'] = latest_blob_image

                    print("sent image to blob:" + str(latest_blob_image))
        else:
            latest_blob_image = ''
            response['bloburl'] = latest_blob_image

        print("Results: " + str(response))
        return response

    except Exception as e:
        print(str(e))
        return 'Error: Could not preprocess image for prediction. ' + str(e)

