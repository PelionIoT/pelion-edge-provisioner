#!/bin/bash

# Copyright (c) 2020, Arm Limited and affiliates.
# Copyright (c) 2020, Izuma Networks
#
# SPDX-License-Identifier: Apache-2.0
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

UPDATE_CERT="dev.cert.der"
FACTORY_ZIP="factory_configurator_utility.zip"
KEYSTORE="keystore"
CA_PRIVATE="CA_private.pem"
CA_CERT="CA_cert.pem"
FCU="fcu.yml"

if [[ $1 == "" ]]; then
    echo "Please provide the relative fcu configuration directory path!"
    exit 1
fi

FCU_CONFIG_DIR=$(pwd)"/$1"
echo "Verifying fcu configuration: $FCU_CONFIG_DIR"

ls "$FCU_CONFIG_DIR"

usage() {
    echo "FCU configuration folder should have - "
    echo "$FCU_CONFIG_DIR"
    echo "--- $FCU"
    echo "--- $FACTORY_ZIP"
    echo "--- $UPDATE_CERT (optional)"
    echo "--- $KEYSTORE"
    echo "--- --- $CA_PRIVATE"
    echo "--- --- $CA_CERT"
    exit 1
}

if [ ! -e "$FCU_CONFIG_DIR/$FACTORY_ZIP" ]; then
    echo "ERROR: Could not find $FACTORY_ZIP in $FCU_CONFIG_DIR"
    usage
fi

if [ ! -e "$FCU_CONFIG_DIR/$FCU" ]; then
    echo "ERROR: Could not find fcu.yml in $FCU_CONFIG_DIR"
    usage
fi

if [ ! -e "$FCU_CONFIG_DIR/$KEYSTORE/$CA_PRIVATE" ]; then
    echo "ERROR: Could not find $FCU_CONFIG_DIR/$KEYSTORE/$CA_PRIVATE"
    usage
fi

if [ ! -e "$FCU_CONFIG_DIR/$KEYSTORE/$CA_CERT" ]; then
    echo "ERROR: Could not find $FCU_CONFIG_DIR/$KEYSTORE/$CA_CERT"
    usage
fi

if [ ! -e "$FCU_CONFIG_DIR/$UPDATE_CERT" ]; then
    echo "WARNING, No update auth certificate ($UPDATE_CERT) found!"
fi

# Check
echo "FCU configuration looks good, try installing it."
