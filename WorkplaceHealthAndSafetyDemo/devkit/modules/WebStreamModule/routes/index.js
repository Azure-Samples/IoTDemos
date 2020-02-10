// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for
// full license information.

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render(
    'index',
    {
      title: 'Webstream Video',
      rtspSource: `rtsp://${process.env.RTSP_IP}:${process.env.RTSP_PORT}/${process.env.RTSP_PATH}`
    });
});

module.exports = router;
