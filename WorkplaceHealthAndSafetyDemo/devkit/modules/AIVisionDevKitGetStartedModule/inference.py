import json


class Inference:

    def __init__(self, inference_object):
        self.id = inference_object.id
        # remove junk final character from the label
        self.label = inference_object.label.strip(" .\t\n")
        self.confidence = inference_object.confidence
        self.position_x = inference_object.position.x
        self.position_y = inference_object.position.y
        self.width = inference_object.position.width
        self.height = inference_object.position.height
        self.message_type = "inference"

    def to_json(self):
        return json.dumps(self.__dict__)
