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

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IdentitySchema = new Schema({
    serialNumber: {
        type: String,
        unique : true,
        required:true,
        index: true
    },
    OU: {
        type: String
    },
    deviceID:{
        type: String
    },
    deployed: {
        type: Boolean,
        required: true
    },
    ethernetMAC: {
        type: [Number],
        default: undefined
    },
    hardwareVersion: {
        type: String,
        required: true
    },
    radioConfig: {
        type: String,
        required: true
    },
    ledConfig: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    cloudAddress: {
        type: String,
        required: true
    },
    apiAddress: {
        type: String
    },
    gatewayServicesAddress: {
        type: String,
        required: true
    },
    hash: {
        type: [Number],
        default: undefined
    },
    sixBMAC: {
        type: [Number],
        default: undefined
    },
    enrollmentID: {
        type: String
    },
    createdAt: {
        type: Number,
        default: Date.now()
    }
}, { versionKey: false });

module.exports = mongoose.model('edge_identity', IdentitySchema);