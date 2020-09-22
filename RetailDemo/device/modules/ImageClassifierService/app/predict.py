
from urllib.request import urlopen
from datetime import datetime
from operator import itemgetter

import tensorflow as tf
from PIL import Image, ImageDraw
from object_detection import ObjectDetection
import numpy as np
import sys
import uuid
import io
import time


MODEL_FILENAME = 'model.pb'
LABELS_FILENAME = 'labels.txt'
PREDICTION_THRESHOLD = 0.85

od_model = None
last_upload_time = None
send_interval = 5
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

    print("Initializing Prediction Model")

    # Load a TensorFlow model
    graph_def = tf.compat.v1.GraphDef()
    with tf.io.gfile.GFile(MODEL_FILENAME, 'rb') as f:
        graph_def.ParseFromString(f.read())

    # Load labels
    with open(LABELS_FILENAME, 'r') as f:
        labels = [l.strip() for l in f.readlines()]

    od_model = TFObjectDetection(graph_def, labels)

    print("Model and labels loaded.")


def predict_image(image):
    global last_upload_time
    try:
        print("Predicting Image")
        if image.mode != "RGB":
            print("Converting to RGB")
            image = image.convert("RGB")

        predictions = od_model.predict_image(image)
        
        response = { 'created': datetime.utcnow().isoformat(), 'grocery_items': 0}

        if predictions:
            print(predictions)
            grocery_item_count = 0
            for p in predictions:
                if p["tagName"] == "GroceryItem" and p["probability"] > PREDICTION_THRESHOLD:
                    grocery_item_count += 1
            response['grocery_items'] = grocery_item_count

        print("Results: " + str(response))
        return response

    except Exception as e:
        print(str(e))
        return 'Error: Could not preprocess image for prediction. ' + str(e)
