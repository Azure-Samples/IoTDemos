// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for
// full license information.

const http = require('http');
const ws = require('ws');
const Process = require('child_process');

// A class that sets up a stream server, watches for web socket connections, controls lifetime
// of ffmpeg video streaming, and sends the video stream to clients connected over web sockets
class Mpeg4Stream {
    constructor(secret, streamingPort, wsPort) {
        this.secret = secret;
        this.streamingPort = streamingPort;
        this.wsPort = wsPort;

        this.ffmpegProcess = undefined;
    }

    isVideoStreaming() {
        return !!this.ffmpegProcess && !this.ffmpegProcess.killed;
    }

    // Send video stream over the configured camera to the specified streaming port on localhost
    startVideo() {
        if (this.isVideoStreaming()) {
            console.log(`Video is already streaming.`);
            return;
        }

        const rtspIp = process.env.RTSP_IP;
        const rtspPort = process.env.RTSP_PORT;
        const rtspPath = process.env.RTSP_PATH;

        if (!rtspIp || !rtspPort || !rtspPath) {
            console.error(`Necessary environment variables have not been set: RTSP_IP=${rtspIp}, RTSP_PORT=${rtspPort}, RTSP_PATH=${rtspPath}.`);
            return;
        }

        const rtspUrl = `rtsp://${rtspIp}:${rtspPort}/${rtspPath}`;
        const ffmpegParams = `-loglevel fatal -i ${rtspUrl} -vcodec copy -an -sn -dn -reset_timestamps 1 -movflags empty_moov+default_base_moof+frag_keyframe -bufsize 256k -f mp4 -seekable 0 -headers Access-Control-Allow-Origin:* -content_type video/mp4 http://127.0.0.1:${this.streamingPort}/${this.secret}`;
        console.log(`Running: ffmpeg ${ffmpegParams}`);

        this.ffmpegProcess = Process.spawn('ffmpeg', ffmpegParams.split(' '));

        this.ffmpegProcess.on('exit', (code, signal) => {
            console.log(`Process ffmpeg exited with code ${code} and signal ${signal}.`);
        });
    }

    // Stop video streaming
    stopVideo() {
        if (!this.ffmpegProcess) {
            console.warn(`Tried to stop video when ffmpeg wasn't known to be running.`);
            return;
        }

        const ffmpegProcess = this.ffmpegProcess;
        this.ffmpegProcess = undefined;
        ffmpegProcess.kill();
        console.log(`Terminated ffmpeg process.`);

        if (process.platform === 'win32') {
            console.log('Running taskkill on ffmpeg to ensure all child processes are closed.');
            Process.exec('taskkill.exe /IM ffmpeg.exe /F');
        }
    }
    
    // Starts up the streaming server to listen to ffmpeg-source video stream, and relays that stream
    // to clients connected over web sockets
    startStreamingServer() {
        this.socketServer = new ws.Server({ port: this.wsPort, perMessageDeflate: false });
        this.socketServer.connectionCount = 0;

        this.socketServer.on('connection', (socketClient, upgradeReq) => {
            const req = upgradeReq || socketClient.upgradeReq;
            this.socketServer.connectionCount++;
            socketClient.id = req.headers['sec-websocket-key'];
            console.log(`New client connected:\n\taddress: ${req.socket.remoteAddress}\n\tid: ${socketClient.id}\n\tuser agent: ${req.headers['user-agent']}\n\tnumber: ${this.socketServer.connectionCount}`);

            this.startVideo();
            socketClient.on('close', (code, message) => {
                console.log(`Client disconnected with code [${code}] and message [${message}].`);

                if (--this.socketServer.connectionCount <= 0) {
                    console.log('Connected clients dropped to 0, so stopping video streaming.');
                    this.stopVideo();
                    return;
                }

                console.log(`A client disconnected; (${this.socketServer.connectionCount} clients remaining).`);
            });
        });

        this.socketServer.broadcast = (data) => {
            this.socketServer.clients.forEach((client) => {
                if (client.readyState === ws.OPEN) {
                    client.send(data);
                }
            });
        };

        this.socketServer.close = () => {
            this.socketServer.clients.forEach((client) => {
                if (client.readyState === ws.OPEN) {
                    client.close(1011);  // error code unexpected condition
                }
            });
        };

        // HTTP Server to accept incoming mp4 stream from ffmpeg
        const streamServer = http.createServer((request, response) => {
            const params = request.url.substr(1).split('/');

            if (params[0] !== this.secret) {
                console.error(`Failed stream connection: ${request.socket.remoteAddress}:${request.socket.remotePort} - wrong secret.`);
                response.end();
            }

            response.connection.setTimeout(0);
            console.log(`Stream connected at ${request.socket.remoteAddress}:${request.socket.remotePort}.`);

            request.on('data', (data) => {
                this.socketServer.broadcast(data);
            });

            request.on('end', () => {
                console.log(`Stream closed.`);
                this.socketServer.close();
            });
        });

        streamServer.listen(this.streamingPort);

        console.log(`Listening for incoming mp4 stream on http://127.0.0.1:${this.streamingPort}/${this.secret}`);
        console.log(`Awaiting WebSocket connections on ws://127.0.0.1:${this.wsPort}`);
    }
}

module.exports = Mpeg4Stream;