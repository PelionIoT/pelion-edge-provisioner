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

describe('Test PEP API server, should generate and return a new identity?', function() {

    var serialNumber = "DEV" + Math.random().toString().substr(2, 6);

    it('Response should return new identity in json format', function(done) {

        pep_server.get_one_identity(Object.assign({
            serialNumber: serialNumber,
            port: process.env.FCCE_PORT,
            ip: process.env.FCCE_IP
        }, process.env.GET_IDENTITY_PARAMS)).then((data) => {

            if(data) {
                try {
                    data = JSON.parse(data);
                    logger.debug('Got identity ', data);
                } catch(err) {
                    // If failed that means the respone is already in JSON format
                    done(err);
                    return;
                }
                done();
            } else {
                done('Failed to get identity');
            }

        }, (err) => {
            done(err);
        });

    });

    it('Response should return enrollment identity', function(done) {

        pep_server.get_enrollment_identity(serialNumber).then((enrollIdentityData) => {
            done();
        }, (err) => {
            done(err);
        });
    });

    it('Response should return array of enrollment identities', function(done) {

        pep_server.get_enrollment_identities().then(() => {
            done();
        }, (err) => {
            done(err);
        });
    });

});
