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

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

process.env.PEP_SERVER_URL = "http://localhost:5151";
process.env.API_VERSION = "v3";

global.pep_server = require('./../api-wrapper-js');

const Logger = require('./../utils/logger');
global.logger = new Logger({"moduleName": 'mocha-tests'});

function execute(tc) {

    return new Promise(function (resolve, reject) {

        // Instantiate a Mocha instance.
        const mocha = new Mocha();

        if (fs.existsSync(tc)) {
            mocha.addFile(tc);
        } else {
            logger.error('Test case- ' + tc + ' do not exists!');
            reject('Testcase do not exists!');
            return;
        }

        //Clean up mocha cache
        mocha.files.forEach(function (p) {
            p = path.resolve(p);
            delete require.cache[require.resolve(p)];
        });

        //Increase the default timeout
        mocha.globals().suite._timeout = process.env.MOCHA_TIMEOUT || 10000;

        // Run the tests.
        mocha.run(function (failures) {
            process.on('exit', function () {
                reject(failures);
            });
            if (failures) {
                reject(failures);
            } else {
                resolve("success");
            }
        });

    });

}

execute(__dirname + '/' + process.argv[2]).then(() => {
    logger.info("Success!");
}, (err) => {
    logger.error("Failed ", err);
});