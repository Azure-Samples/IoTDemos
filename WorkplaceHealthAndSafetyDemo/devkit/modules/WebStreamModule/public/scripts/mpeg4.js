/* eslint-disable no-unused-vars */
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for
// full license information.

const mediaSource = new MediaSource();
const queue = [];
const video = document.querySelector('video');
let isPaused = true;
let websocket;
let buffer;

// mp4 header regeneration
let waitForFirstMoof = true;

const ftypPayload = new Uint8Array([
    0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 53, 0, 0, 2, 0, 105, 115, 111, 54, 109, 112, 52, 49,
]);
const moovPayload = new Uint8Array([
    0, 0, 3, 52, 109, 111, 111, 118, 0, 0, 0, 108, 109, 118, 104, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 232, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 214, 116, 114, 97, 107, 0, 0, 0, 92, 116, 107, 104, 100, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 7, 128, 0, 0, 4, 56, 0, 0, 0, 0, 1, 114, 109, 100, 105, 97, 0, 0, 0, 32, 109, 100, 104, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 95, 144, 0, 0, 0, 0, 85, 196, 0, 0, 0, 0, 0, 45, 104, 100, 108, 114, 0, 0, 0, 0, 0, 0, 0, 0, 118, 105, 100, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 86, 105, 100, 101, 111, 72, 97, 110, 100, 108, 101, 114, 0, 0, 0, 1, 29, 109, 105, 110, 102, 0, 0, 0, 20, 118, 109, 104, 100, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 36, 100, 105, 110, 102, 0, 0, 0, 28, 100, 114, 101, 102, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 12, 117, 114, 108, 32, 0, 0, 0, 1, 0, 0, 0, 221, 115, 116, 98, 108, 0, 0, 0, 145, 115, 116, 115, 100, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 129, 97, 118, 99, 49, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 128, 4, 56, 0, 72, 0, 0, 0, 72, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 255, 255, 0, 0, 0, 43, 97, 118, 99, 67, 1, 100, 0, 40, 255, 225, 0, 19, 103, 100, 0, 40, 172, 180, 3, 192, 17, 63, 44, 164, 4, 4, 4, 27, 66, 132, 212, 1, 0, 5, 104, 238, 6, 226, 192, 0, 0, 0, 16, 115, 116, 116, 115, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 115, 116, 115, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 115, 116, 115, 122, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 115, 116, 99, 111, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 109, 118, 101, 120, 0, 0, 0, 32, 116, 114, 101, 120, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 194, 117, 100, 116, 97, 0, 0, 0, 186, 109, 101, 116, 97, 0, 0, 0, 0, 0, 0, 0, 33, 104, 100, 108, 114, 0, 0, 0, 0, 0, 0, 0, 0, 109, 100, 105, 114, 97, 112, 112, 108, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 141, 105, 108, 115, 116, 0, 0, 0, 37, 169, 110, 97, 109, 0, 0, 0, 29, 100, 97, 116, 97, 0, 0, 0, 1, 0, 0, 0, 0, 119, 119, 119, 32, 114, 116, 115, 112, 32, 108, 105, 118, 101, 0, 0, 0, 37, 169, 116, 111, 111, 0, 0, 0, 29, 100, 97, 116, 97, 0, 0, 0, 1, 0, 0, 0, 0, 76, 97, 118, 102, 53, 55, 46, 53, 54, 46, 49, 48, 49, 0, 0, 0, 59, 169, 99, 109, 116, 0, 0, 0, 51, 100, 97, 116, 97, 0, 0, 0, 1, 0, 0, 0, 0, 76, 73, 86, 69, 53, 53, 53, 32, 83, 116, 114, 101, 97, 109, 105, 110, 103, 32, 77, 101, 100, 105, 97, 32, 118, 50, 48, 49, 54, 46, 48, 49, 46, 50, 57,
]);

function OnClickPlay() {
    console.log('OnClickPlay fired. isPaused: ' + isPaused);
    document.getElementById('playButton').style.display = 'none';
    if (!isPaused || websocket) {
        return;
    }

    isPaused = false;
    video.currentTime = 0;

    websocket = new WebSocket('ws://' + document.location.hostname + ':3002');
    websocket.binaryType = 'arraybuffer';
    websocket.onopen = (event) => {
        try {
            console.log('Connection established.');
            video.src = window.URL.createObjectURL(mediaSource);
        } catch (err) {
            console.error('Exception opening websocket!');
            console.log(err);
        }
    }

    websocket.addEventListener('message', (e) => {
        try {
            if (buffer && typeof e.data !== 'string') {

                let payload = e.data;
                if (waitForFirstMoof) {
                    if (payload.byteLength > 8) {
                        let payloadView = new Uint8Array(payload);
                        if (
                            payloadView[4] === 109 &&   //moof
                            payloadView[5] === 111 &&
                            payloadView[6] === 111 &&
                            payloadView[7] === 102
                        ) {
                            // inject the mp4 header into the stream
                            buffer.appendBuffer(ftypPayload);
                            queue.push(moovPayload);
                            waitForFirstMoof = false;
                        }
                    }

                    if (waitForFirstMoof) {
                        return;
                    }
                }

                // process moof packet
                if (e.data.byteLength > 8) {
                    let packet = new Uint8Array(payload);

                    if (
                        packet[4] === 109 &&   //moof
                        packet[5] === 111 &&
                        packet[6] === 111 &&
                        packet[7] === 102
                    ) {
                        payload = packet;
                        if (packet[64] === 116 &&   //tfdt
                            packet[65] === 102 &&
                            packet[66] === 100 &&
                            packet[67] === 116
                        ) {
                            // for live streams, set the BaseMediaDecodeTime to zero
                            // Note: Safari requires baseMediaDecodeTime to be set to zero
                            packet[72] = 0;
                            packet[73] = 0;
                            packet[74] = 0;
                            packet[75] = 0;
                            packet[76] = 0;
                            packet[77] = 0;
                            packet[78] = 0;
                            packet[79] = 0;
                        }
                    }
                }

                if (buffer.updating || queue.length > 0) {
                    queue.push(payload);
                } else {
                    buffer.appendBuffer(payload);
                }
            }
        } catch (err) {
            console.error('Exception in websocket message!');
            console.log(err);
        }
    }, false);

    websocket.onerror = (event) => {
        console.error('WebSocket error!');
        console.log(event);
        console.log('WebSocket ready state: ' + websocket.readyState);
    }

    websocket.onclose = (event) => {
        let reason;
        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
        if (event.code === 1000)
            reason = `Normal closure, meaning that the purpose for which the connection was established has been fulfilled.`;
        else if (event.code === 1001)
            reason = `An endpoint is "going away", such as a server going down or a browser having navigated away from a page.`;
        else if (event.code === 1002)
            reason = `An endpoint is terminating the connection due to a protocol error`;
        else if (event.code === 1003)
            reason = `An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).`;
        else if (event.code === 1004)
            reason = `Reserved. The specific meaning might be defined in the future.`;
        else if (event.code === 1005)
            reason = `No status code was actually present.`;
        else if (event.code === 1006)
            reason = `The connection was closed abnormally, e.g., without sending or receiving a Close control frame`;
        else if (event.code === 1007)
            reason = `An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).`;
        else if (event.code === 1008)
            reason = `An endpoint is terminating the connection because it has received a message that "violates its policy". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.`;
        else if (event.code === 1009)
            reason = `An endpoint is terminating the connection because it has received a message that is too big for it to process.`;
        else if (event.code === 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
            reason = `An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: ` + event.reason;
        else if (event.code === 1011)
            reason = `A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.`;
        else if (event.code === 1015)
            reason = `The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).`;
        else
            reason = `Unknown reason`;

        if (event.code !== 1000) { 
            console.error('WebSocket closed due to: ' + reason);
        } else {
            console.log('WebSocket closed due to: ' + reason);
        }

        console.log(event);

        // restart the video stream on network errors
        if (!isPaused) {
            isPaused = true;
            OnClickPlay();
        }
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (websocket) {
            websocket.close(1000);
            websocket = null;
        }
        isPaused = true;
    } else {
        OnClickPlay();
    }
}, false);

video.addEventListener('pause', () => {
    if (websocket) {
        websocket.close(1000);
        websocket = null;
    }
    isPaused = true;
}, false);

video.addEventListener('play', () => {
    if (isPaused) {
        OnClickPlay();
    }
}, false);

video.addEventListener('canplay', () => {
    console.log('event canplay: ' + video.paused);
    if (video.paused) {
        const promise = video.play();
        if (promise !== undefined) {
            promise.then(_ => {
                // Autoplay started!
                console.log('autoplay started');
            }).catch(error => {
                // Autoplay was prevented.
                // Show a "Play" button so that user can start playback.
                document.getElementById("playButton").style.display = null;
                console.error('Autoplay failed due to: ' + error);
            });
        } else {
            document.getElementById("playButton").style.display = null;
        }
    }
});

mediaSource.addEventListener('sourceopen', (e) => {
    console.log('MediaSource sourceopen fired: ' + mediaSource.readyState);

    waitForFirstMoof = true;

    mediaSource.duration = +Infinity;
    buffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
    buffer.mode = "sequence";

    buffer.addEventListener('error', (e) => {
        console.error('Buffer error!');
        console.log(e);
    });
    buffer.addEventListener('abort', (e) => {
        console.error('Buffer abort!');
        console.log(e);
    });
    buffer.addEventListener('update', (e) => { // Note: Have tried 'updateend'
        if (queue.length > 0 && !buffer.updating) {
            buffer.appendBuffer(queue.shift());
        }
    });
}, false);

mediaSource.addEventListener('sourceended', (e) => {
    console.log('Source ended.');
    console.log(e);
});
mediaSource.addEventListener('sourceclose', (e) => {
    console.log('Source closed.');
    console.log(e);
});
mediaSource.addEventListener('error', (e) => {
    console.error('Source error!');
    console.log(e);
});

window.onload = function () {
    OnClickPlay();
};