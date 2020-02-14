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
const fs = require('fs');
const execSync = require('child_process').execSync;
const pep_server = require('./../api-wrapper-js');

if(!process.env.PEP_SERVER_URL) process.env.PEP_SERVER_URL = "http://localhost:5151";
if(!process.env.API_VERSION) process.env.API_VERSION = "v3";

program
    .name('pep get-one-identity')
    .usage('[<options>]')
    .option('-a, --api_url <ip_or_dns>', 'pelion cloud api url', 'https://api.us-east-1.mbedcloud.com')
    .option('-g, --gw_url <ip_or_dns>', 'pelion cloud gateway service address', 'https://gateways.us-east-1.mbedcloud.com')
    .option('-s, --serial_number <string_value>', 'serial number of the gateway')
    .option('-w, --hardware_version <string_value>', 'hardware version of the gateway, refer configurations section in ' + __dirname + '/lib/radioProfile.template.json')
    .option('-r, --radio_config <string_value>', 'radio configuration of the gateway, refer configurations section in ' + __dirname + '/lib/radioProfile.template.json', '00')
    .option('-l, --led_config <string_value>', 'status led configuration of the gateway', '01')
    .option('-c, --category <string_value>', 'developer or production', 'production')
    .requiredOption('-i, --ip_address <ip>', 'ip address of the gateway where factory-configurator-client is running')
    .requiredOption('-p, --port <port_number>', 'port number of factory-configurator-client process')
    .parse(process.argv);

console.warn('WARN - Make sure you are running the factory-configurator-client-example for this to complete successfully!');

var query = {};

if(program.api_url) {
    query.apiAddress = program.api_url;
}
if(program.gw_url) {
    query.gatewayServicesAddress = program.gw_url;
}
if(program.serial_number) {
    query.serialNumber = program.serial_number;
}
if(program.hardware_version) {
    query.hardwareVersion = program.hardware_version;
}
if(program.radio_config) {
    query.radioConfig = program.radio_config;
}
if(program.led_config) {
    query.ledConfig = program.led_config;
}
if(program.category) {
    query.category = program.category;
}
if(program.ip_address) {
    query.ip = program.ip_address;
}
if(program.port) {
    query.port = program.port;
}

console.log("Searching for ", query);

pep_server.get_one_identity(query).then((data) => {
    console.log(data);

    // Save the identity in a file
    fs.writeFileSync('./identity.json', JSON.stringify(JSON.parse(data), null, 4), 'utf8');
    console.log("Successfully created identity file and saved at ./identity.json");

}, (err) => {
    console.error("Failed to find a identity!");
});