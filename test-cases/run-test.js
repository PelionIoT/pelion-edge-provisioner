/*
 * Copyright (c) 2021, Arm Limited and affiliates.
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
const glob = require('glob');

Mocha.reporters.Base.symbols.ok = "[PASS]";
Mocha.reporters.Base.symbols.err = "[FAIL]";

global.pep_server = require('./api-wrapper-js');

const Logger = require('./../utils/logger');
global.logger = new Logger({"moduleName": 'mocha-tests'});

process.env = Object.assign(require('./config.json'), process.env);

const api_server = require('./../api-server/index.js');

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

function run(tc) {

    return new Promise((resolve, reject) => {

        execute(tc).then(function () {
            resolve();
        }, function (err) {
            reject(err);
        });
    });

}

setTimeout(() => {

    var test_path = path.join(__dirname, process.env.EXECUTE_TEST_CASE);

    if(fs.lstatSync(test_path).isDirectory()) {

        var getTestFiles = function (src, callback) {
            return new Promise((resolve, reject) => {
                glob(src + '/**/*', (err, res) => {
                    if(err) {
                        return reject(err);
                    }
                    resolve(res.filter(f => f.indexOf('.js') > -1));
                });
            });
        };

        getTestFiles(test_path).then((tests) => {

            var inx = 0;
            function next() {
                if(inx < tests.length) {
                    run(tests[inx]).then(() => {
                        inx++;
                        next();
                    }, (err) => {
                        logger.error("Failed with error " + JSON.stringify(err, null, 4));
                        process.exit(1);
                    });
                } else {
                    logger.info("Success!");
                    process.exit(0);
                }
            }

            next();
        }, (err) => {
            logger.error("failed to get test files " + JSON.stringify(err, null ,4));
            process.exit(1);
        });

    } else {
        run(test_path).then(() => {
            logger.info("Success!");
            process.exit(0);
        }, (err) => {
            logger.error("Failed with error " + JSON.stringify(err, null, 4));
            process.exit(1);
        });
    }

}, 5000);