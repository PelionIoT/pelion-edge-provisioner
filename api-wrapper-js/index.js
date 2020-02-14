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

'use strict';

const request = require('request');
const fs = require('fs');
const Logger = require('./../utils/logger');
global.logger = new Logger( { moduleName: "sdk" } );

global.execute = (params, callback) => {
    logger.debug("Requesting - ", params);

    request(params, (err, response, body) => {
        if(err) {
            if(response) {
                logger.error("Failed with error=%d, msg=%s", response.statusCode, response.statusMessage);
            } else {
                logger.error(err);
            }
        }
        if(response && response.statusCode == 200) {
            logger.info('Request=%s, Success with code=%d, msg=%s',
                (params.method.toUpperCase() + ' ' + params.uri),
                response.statusCode, response.statusMessage);
            logger.debug('Response body ', response.body);
        } else {
            if(response) {
                logger.error('Error with code=%d, msg=%s, body=%s', response.statusCode, response.statusMessage, JSON.stringify(body));
            }
        }
        callback(err, response, body);
    });
};

if(!process.env.PEP_SERVER_URL) process.env.PEP_SERVER_URL = "http://localhost:5151";
if(!process.env.API_VERSION) process.env.API_VERSION = "v3";

var apis = {};
fs.readdirSync(__dirname + '/apis').forEach((file) => {
    apis = Object.assign(apis, require('./apis/' + file));
});

module.exports = apis;
