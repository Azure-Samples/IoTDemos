# WebStreamModule

To view the RTSP camera stream from the Vision AI Developer Kit, one needs to use a media player (e.g. VLC) or connect an HDMI cable to an available monitor. This module is provided as a way to view the RTSP camera feed in an HTML5 web browser, in order to reduce the barrier to viewing the stream.

It reads 3 environment variables (CAMERA_IP, RTSP_PORT, and RTSP_PATH) to build the URI to the RTSP stream (i.e. rtsp://<RTSP_IP>:<RTSP_PORT>/<RTSP_PATH>). These environment variables should be specified in the docker deployment config, and by default are set to good values for the Vision AI Developer Kit.

## View the webstream

Find the IP address of the IoT Edge device:

- At the end of AP set up, the IP address is shown.
- Using a serial or network connection open a shell window to the device and type `ifconfig wlan0` to see the wireless IP address.

> Note: your workstation may need to be on the same WLAN as the device to access it.

Open a browser to http://CAMERA_IP:3000 where RTSP_IP is the IP address you found above.

## Troubleshooting

- Browser
  - Open developer tools in your browser, and view the Console to look for any client-side errors.
  - If the stream fails to load, check the RTSP stream by using a media player (e.g. VLC).
- Server
  - Once deployed, check the logs `iotedge logs WebStreamModule` to view traces from the website. The edgeAgent and edgeHub modules may also have relevant output to check.
  - If the ffmpeg process failed to start, it can be made to restart if the number of connected clients goes to zero, and then a client connects again.
    - So, if you only have 1 page viewing the feed, and you refresh, it will restart ffmpeg.
    - Note, this also means that if no clients are viewing the stream, ffmpeg will not run and therefore not consume any CPU cycles.
  - The module requires ports 3000-3002 to be used by the website. If those ports are in use by other software, there could be a conflict.