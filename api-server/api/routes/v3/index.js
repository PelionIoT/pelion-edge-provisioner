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
const hal = require('hal');

const Logger = require('./../../../../utils/logger');
const logger = new Logger( {moduleName: 'api-v3'});

//Developer debugging routes
router.use(require('./internal.js'));

const IdentityCollection = mongoose.model('edge_identity');

var _create_a_new_identity = function(params) {

    return new Promise((resolve, reject) => {

        IdentityCollection.findOne({serialNumber: params.serialNumber}).then((savedIdentity) => {

            if(savedIdentity) {
                return reject({
                    code: 409,
                    message: 'Identity with this serial number exists already!'
                })
            }

            let identity = JSON.parse(JSON.stringify(params));
            let doc = new IdentityCollection(identity);

            doc.save((err, data) => {
                if(err) {
                    reject({
                        code: 500,
                        message: err
                    });
                } else {
                    resolve(identity);
                }
            });
        });

    });

};

// Get a gateway identity
router.get('/identity', (req, res) => {

    var remoteAddress = req.query.ip || req.connection.remoteAddress;

    // After FCC 3.2.0, a random tcp port is used. Not sure why this change was introduced.
    // Reference - https://github.com/ARMmbed/factory-configurator-client-example-internal/commit/9d0728951a9c9657e81363be2d9a24265b945e14
    var remotePort = req.query.port || '7777';

    function execute_fcu(identity) {

        return new Promise((resolve, reject) => {

            try {

                var command = 'export LC_ALL=C.UTF-8; export LANG=C.UTF-8; FCU_HOME_DIR=/opt/fcu-package /opt/fcu-ve/bin/python3 \
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
    req.query.serialNumber = decodeURI(req.query.serialNumber);
    req.query.gatewayServicesAddress = decodeURI(req.query.gatewayServicesAddress);
    req.query.apiAddress = decodeURI(req.query.apiAddress);
    req.query.cloudAddress = req.query.gatewayServicesAddress;
    req.query.verificationKey = decodeURI(req.query.verificationKey);

    _create_a_new_identity(req.query).then((identityData) => {

        IdentityCollection.findOne(req.query, {_id: 0}).then((data) => {

            if(!data) {
                return res.status(404).send();
            }

            execute_fcu(data).then((updated_identity) => {

                IdentityCollection.findOneAndUpdate(req.query, updated_identity).then((data) => {

                    var output = Object.assign(identityData, updated_identity.toObject());
                    delete output.verificationKey;
                    res.status(200).send(output);

                }, (err) => {
                    logger.error("Failed to findOneAndUpdate ", err);
                    res.status(500).send(err);
                });

            }, (err) => {
                // Delete the created identity as the FCU failed
                IdentityCollection.remove(req.query).then(() => {
                    res.status(500).send(err);
                }, function(err) {
                    res.status(500).send(err);
                })
            });

        }, (err) => {
            logger.error("Failed to findOne ", err);
            res.status(500).send(err);
        });

    }, (err) => {
        if(err && err.code == 11000) {
            res.status(409).send('Duplicate serial number');
        } else if(err && err.code) {
            res.status(err.code).send(err.message);
        } else {
            res.status(500).send(err);
        }
    });

});

router.get('/enrollment-id', function(req, res) {

    if(!req.query || !req.query.serialNumber) {
        return res.status(400).send();
    }

    req.query.deployed = true;
    req.query.serialNumber = decodeURI(req.query.serialNumber);

    IdentityCollection.findOne(req.query).then((data) => {
        if(data) {
            res.status(200).send(data.enrollmentID);
        } else {
            res.status(404).send('Not found!');
        }
    }, (err) => {
        res.status(500).send(err);
    });

});

router.get('/verification-key', function(req, res) {

    if(!req.query || !req.query.serialNumber) {
        return res.status(400).send();
    }

    req.query.deployed = true;
    req.query.serialNumber = decodeURI(req.query.serialNumber);

    IdentityCollection.findOne(req.query).then((data) => {
        if(data) {
            res.status(200).send(data.verificationKey);
        } else {
            res.status(404).send('Not found!');
        }
    }, (err) => {
        res.status(500).send(err);
    });

});

const DESCENDING = -1;
const ASCENDING = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;
const DEFAULT_ORDER = DESCENDING;

function UpdateQueryString(key, value, url) {
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
}

// Retrieve a list of serial number and their enrollment ids
router.get('/enrollment-ids', function(req, res) {
    var limit = DEFAULT_LIMIT;
    var order = DEFAULT_ORDER;
    var query = {
        deployed: true
    };

    if(req.query.limit) {
        limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
        if(limit > MAX_LIMIT) {
            limit = MAX_LIMIT;
        }
    }

    if(typeof req.query.order == 'string' && ["asc", "desc"].indexOf(req.query.order.toLowerCase()) > -1) {
        order = (req.query.order.toLowerCase() == 'desc') ? DESCENDING : ASCENDING;
    }

    if(req.query.last && req.query.last.length > 0) {
        if(order == DESCENDING) {
            query._id = {
                $lt: mongoose.Types.ObjectId(req.query.last)
            }
        } else {
            query._id = {
                $gt: mongoose.Types.ObjectId(req.query.last)
            }
        }
    }

    IdentityCollection.find(query).limit(limit).sort({ "$natural": order }).then((data) => {
        var resrc = new hal.Resource({results: data}, req._parsedUrl.href);
        resrc.total_count = data.length;
        resrc.limit = limit;
        resrc.order = req.query.order || 'DESC';
        if(data.length > 0) {
            resrc.link("next", UpdateQueryString("last", data[data.length - 1]._id, req._parsedUrl.href));
        }
        res.status(200).send(resrc);
    }, (err) => {
        res.status(500).send(err);
    });

});

module.exports = router;
