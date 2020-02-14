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

const fs = require('fs');

describe('Test POST /identity, create a gateway identity?', function() {

    it('Response should return 200, OK', function(done) {

        var identity = JSON.parse(fs.readFileSync(__dirname + '/example-identity.json'), 'utf8');

        pep_server.create_one_identity(identity).then((data) => {
            done();
        }, (err) => {
            done(err);
        });

    });

});
