#!/usr/bin/env node

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

const version = "2.0.0";

const program = require('commander');

if(process.env.DEBUG) {
    console.debug('DEBUG mode is enabled!');
}

program
    .version(version)
    .usage('[options] command {args...}')
    .command('create-one-identity [<options>]', 'create a gateway identity')
    .command('get-one-identity [<options>]', 'get a gateway identity based on the provided filters')
    .command('get-enrollment-id [<options>]', 'get enrollment identity of dispatched gateway')
    .option('-d, --debug' , 'Turns on debug output')
    .parse(process.argv);
