'use strict';
/*
 * Copyright (c) 2019, Arm Limited and affiliates.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const express = require('express');
const router = express.Router();

const requestLog = [];
const config = require('./../../../config.json');

//Logger
const Logger = require('./../../../../utils/logger');
const logger = new Logger( {moduleName: 'internal-v3', color: 'bgGreen'} );

router.all('*', (req, res, next) => {
    if(config.logRequests) {
        try {
            var log = {
                timestamp: new Date(),
                url: req.headers.host + req.url,
                method: req.method,
                params: req.params,
                body: req.body
            };
            logger.debug('Got request, saving to request log- '+ JSON.stringify(log));
            requestLog.push(log);
        } catch(err) {
            logger.error('Failed to log request ' + JSON.stringify(err));
        }
    }
    next();
});

router.get('/requestLog', (req, res) => {
    res.status(200).send(requestLog);
});

module.exports = router;