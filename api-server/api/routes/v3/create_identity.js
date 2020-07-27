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

const fs = require('fs');
const execSync = require('child_process').execSync;

var create_identity = (identity) => {

    return new Promise((resolve, reject) => {

        var self_signed_certs_file_path = __dirname + '/.self_signed_certs';

        fs.stat(self_signed_certs_file_path, function(err, stats) {

            if(err) {
                if(err.code == "ENOENT") {

                    // If do not exist then create the self-signed certificate
                    execSync(__dirname + '/generate_self_signed_certs.sh ' + self_signed_certs_file_path);

                } else {

                    console.error("Failed to get stats of self_signed_certs_folder ", err);
                    reject(err);

                }
            }

            var device_key = fs.readFileSync(self_signed_certs_file_path + '/device_private_key.pem', 'utf8');
            var device_cert = fs.readFileSync(self_signed_certs_file_path + '/device_cert.pem', 'utf8');
            var root_cert = fs.readFileSync(self_signed_certs_file_path + '/root_cert.pem', 'utf8');
            var intermediate_cert = fs.readFileSync(self_signed_certs_file_path + '/intermediate_cert.pem', 'utf8');

            identity = Object.assign(identity, {
                ssl: {
                    client: {
                        key: device_key,
                        certificate: device_cert
                    },
                    server: {
                        key: device_key,
                        certificate: device_cert
                    },
                    ca: {
                        ca: root_cert,
                        intermediate: intermediate_cert
                    }
                }
            });

            resolve(identity);

        });

    });

};

module.exports = create_identity;