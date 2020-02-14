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

const program = require('commander');
const pep_server = require('./../api-wrapper-js');

if(!process.env.PEP_SERVER_URL) process.env.PEP_SERVER_URL = "http://localhost:5151";
if(!process.env.API_VERSION) process.env.API_VERSION = "v3";

program
    .name('pep create-identity')
    .usage('[<options>]')
    .requiredOption('-a, --api_url <ip_or_dns>', 'pelion cloud api url', 'https://api.us-east-1.mbedcloud.com')
    .requiredOption('-g, --gw_url <ip_or_dns>', 'pelion cloud gateway service address', 'https://gateways.us-east-1.mbedcloud.com')
    .requiredOption('-s, --serial_number <string_value>', 'serial number of the gateway')
    .requiredOption('-w, --hardware_version <string_value>', 'hardware version of the gateway, refer configurations section in ' + __dirname + '/lib/radioProfile.template.json')
    .requiredOption('-r, --radio_config <string_value>', 'radio configuration of the gateway, refer configurations section in ' + __dirname + '/lib/radioProfile.template.json', '00')
    .option('-l, --led_config <string_value>', 'status led configuration of the gateway', '01')
    .option('-c, --category <string_value>', 'developer or production', 'production')
    .parse(process.argv);

// Create an identity based on the parameters
pep_server.create_one_identity({
    serialNumber: program.serial_number,
    hardwareVersion: program.hardware_version,
    radioConfig: program.radio_config,
    ledConfig: program.led_config,
    category: program.category,
    gatewayServicesAddress: program.gw_url,
    apiAddress: program.api_url,
    cloudAddress: program.gw_url
}).then((data) => {

    console.log('Successfully created an identity!');

}, (err) => {
    console.error("Failed to upload the identity to pep-server ", err);
    process.exit(1);
});