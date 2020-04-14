
import json
import os
import io

# Imports for the REST API
from flask import Flask, request, jsonify
import logging

# Imports for image procesing
from PIL import Image

# Imports for prediction
from predict import initialize, predict_image

#imports for blob storage
from azure.storage.blob import BlobServiceClient, BlobClient

app = Flask(__name__)
blob_service_client = None
log = logging.getLogger('werkzeug')
log.disabled = True


# 4MB Max image size limit
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024 

# Default route just shows simple text
@app.route('/')
def index():
    return 'CustomVision.ai model host harness'

# Like the CustomVision.ai Prediction service /image route handles either
#     - octet-stream image file 
#     - a multipart/form-data with files in the imageData parameter
@app.route('/image', methods=['POST'])
@app.route('/<project>/image', methods=['POST'])
@app.route('/<project>/image/nostore', methods=['POST'])
@app.route('/<project>/classify/iterations/<publishedName>/image', methods=['POST'])
@app.route('/<project>/classify/iterations/<publishedName>/image/nostore', methods=['POST'])
@app.route('/<project>/detect/iterations/<publishedName>/image', methods=['POST'])
@app.route('/<project>/detect/iterations/<publishedName>/image/nostore', methods=['POST'])
def predict_image_handler(project=None, publishedName=None):
    global blob_service_client
    try:
        imageData = None
        if ('imageData' in request.files):
            imageData = request.files['imageData']
        elif ('imageData' in request.form):
            imageData = request.form['imageData']
        else:
            imageData = io.BytesIO(request.get_data())
        if blob_service_client == None:
            print("create blob_service_client")
            storage_name = request.args.get('storagename')
            storage_key = request.args.get('storagekey')
            url = "https://{}.blob.core.windows.net".format(storage_name)
            blob_service_client = BlobServiceClient(account_url=url, credential=storage_key)    

    
        img = Image.open(imageData)
        results = predict_image(img, blob_service_client)
        return jsonify(results)
    except Exception as e:
        print('EXCEPTION:', str(e))
        return 'Error processing image', 500

if __name__ == '__main__':
    # Load and intialize the model
    initialize()

    # Run the server
    app.run(host='0.0.0.0', port=80)

