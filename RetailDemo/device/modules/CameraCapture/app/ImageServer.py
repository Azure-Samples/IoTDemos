# Base on work from https://github.com/Bronkoknorb/PyImageStream
import trollius as asyncio
import tornado.ioloop
import tornado.web
import tornado.websocket
import threading
import base64
import os

camera_capture = None

class ImageStreamHandler(tornado.websocket.WebSocketHandler):
    def initialize(self):
        self.clients = []

    def check_origin(self, origin):
        return True

    def open(self):
        self.clients.append(self)
        print("Image Server Connection::opened")

    def on_message(self, msg):
        global camera_capture
        if msg == 'next':
            frame = camera_capture.get_display_frame()
            if frame != None:
                encoded = base64.b64encode(frame)
                self.write_message(encoded, binary=False)

    def on_close(self):
        self.clients.remove(self)
        print("Image Server Connection::closed")


class ImageServer(threading.Thread):

    def __init__(self, port, cameraObj):
        global camera_capture
        threading.Thread.__init__(self)
        self.setDaemon(True)
        self.port = port
        camera_capture = cameraObj

    def run(self):
        try:
            asyncio.set_event_loop(asyncio.new_event_loop())

            indexPath = os.path.join(os.path.dirname(
                os.path.realpath(__file__)), 'templates')
            app = tornado.web.Application([
                (r"/stream", ImageStreamHandler, {}),
                (r"/(.*)", tornado.web.StaticFileHandler,
                 {'path': indexPath, 'default_filename': 'index.html'})
            ])
            app.listen(self.port)
            print('ImageServer::Started.')
            tornado.ioloop.IOLoop.instance().start()
        except Exception as e:
            print('ImageServer::exited run loop. Exception - ' + str(e))

    def close(self):
        ioloop = tornado.ioloop.IOLoop.instance()
        ioloop.add_callback(ioloop.stop)
        print('ImageServer::Closed.')

    def setCameraCapture(self, cameraObj):
        global camera_capture
        camera_capture = cameraObj