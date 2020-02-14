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
const pep_server = require('./../dispatcher-sdk-js');

if(!process.env.PEP_SERVER_URL) process.env.PEP_SERVER_URL = "http://localhost:5151";
if(!process.env.API_VERSION) process.env.API_VERSION = "v3";

program
    .name('pep get-enrollment-id')
    .usage('[<options>]')
    .requiredOption('-s, --serial_number <string_value>', 'get enrollment-id of the gateway based on its serial number')
    .parse(process.argv);

pep_server.get_enrollment_identity(program.serial_number).then((data) => {
    console.log("serial_number=%s, enrollement_identity=%s", program.serial_number, data);
}, (err) => {
    console.error("Failed to get eid!");
});

