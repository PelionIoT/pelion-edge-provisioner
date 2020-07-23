/*
 * Copyright (c) 2020, Arm Limited and affiliates.
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

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const exec = require('child_process').exec;

const create_identity = require('./create_identity');

const Logger = require('./../../../../utils/logger');
const logger = new Logger( {moduleName: 'api-v3'});

//Developer debugging routes
router.use(require('./internal.js'));

const IdentityCollection = mongoose.model('edge_identity');


var _create_a_new_identity = function(params) {

    return new Promise((resolve, reject) => {

        create_identity(params).then((identity) => {

            let doc = new IdentityCollection(identity);

            doc.save((err, data) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

    });

};

// Create batch of gateway identities
router.post('/batch/identity', (req, res) => {
    res.status(501).send();
});

// Get a gateway identity
router.get('/identity', (req, res) => {

    var remoteAddress = req.query.ip || req.connection.remoteAddress;

    // After FCC 3.2.0, a random tcp port is used. Not sure why this change was introduced.
    // Reference - https://github.com/ARMmbed/factory-configurator-client-example-internal/commit/9d0728951a9c9657e81363be2d9a24265b945e14
    var remotePort = req.query.port || '7777';

    function execute_fcu(identity) {

        return new Promise((resolve, reject) => {

            try {

                var command = 'export LC_ALL=C.UTF-8; export LANG=C.UTF-8; FCU_HOME_DIR=/opt/fcu-package /opt/fcu-ve/bin/python3.6 \
                /opt/fcu-package/ft_demo/sources/ft_demo.py inject --endpoint-name=' + identity.serialNumber +' --serial-number='+ identity.serialNumber + ' \
                tcp --ip='+ remoteAddress + ' --port=' + remotePort;

                logger.info('Executing ' + command);

                var stdbuf = '';
                var cmd_cp = exec(command, function(err, stdout, stderr) {

                });

                cmd_cp.stdout.on('data', function(buf) {
                    stdbuf += String(buf);
                });

                cmd_cp.stderr.on('data', function(buf) {
                    stdbuf += String(buf);
                });

                cmd_cp.on('close', function(code) {

                    logger.info("Exicted with code " + code);
                    logger.info(stdbuf);

                    if(code != 0) {
                        reject('Make sure you are running fcc-example on the gateway with ip=' + remoteAddress + ' at port=' + remotePort +'. Also inspect the pep-api-server logs to know more about this error - docker logs -f pep-api-server');
                    } else {

                        identity.enrollmentID = stdbuf.slice(stdbuf.indexOf('enrollment id: ') + 15, stdbuf.indexOf('enrollment id: ') + 15 + 97);
                        identity.deployed = true;

                        resolve(identity);
                    }
                });

            }
            catch (err) {
                var errmsg = err.stdout ? err.stdout.toString() : err;
                logger.error('FCU failed: ', errmsg);
                reject(errmsg);
            }
        });

    }

    delete req.query.ip;
    delete req.query.port;

    req.query.deployed = false;
    req.query.category = req.query.category || 'production';
    req.query.cloudAddress = req.query.cloudAddress || req.query.gatewayServicesAddress;

    _create_a_new_identity(req.query).then((identityData) => {

        IdentityCollection.findOne(req.query, {_id: 0}).then((data) => {

            if(!data) {
                return res.status(404).send();
            }

            execute_fcu(data).then((updated_identity) => {

                IdentityCollection.findOneAndUpdate(req.query, updated_identity, {new: true}).then((data) => {
                    res.status(200).send(data);
                }, (err) => {
                    logger.error("Failed to findOneAndUpdate ", err);
                    res.status(500).send(err);
                });

            }, (err) => {
                res.status(500).send(err);
            });

        }, (err) => {
            logger.error("Failed to findOne ", err);
            res.status(500).send(err);
        });

    }, (err) => {
        res.status(500).send(err);
    });

});

router.get('/enrollment-id', function(req, res) {

    if(!req.query || !req.query.serialNumber) {
        return res.status(400).send();
    }

    IdentityCollection.findOne(req.query).then((data) => {
        res.status(200).send(data.enrollmentID);
    }, (err) => {
        res.status(500).send(err);
    });

});



module.exports = router;
