#!/bin/bash

# Copyright (c) 2020, Arm Limited and affiliates.
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

if [[ $1 == "" ]]; then
    echo "Please provide the relative fcu configuration directory path!"
    exit 1
fi

FCU_CONFIG_DIR=`pwd`"/$1"
echo "Verifying fcu configuration- $FCU_CONFIG_DIR"

ls $FCU_CONFIG_DIR

usage() {
    echo "FCU configuration folder should have - "
    echo "<fcu_config_dir>"
    echo "--- fcu.yml"
    echo "--- factory_configurator_utility.zip"
    echo "--- update-auth-certificate.der (optional)"
    echo "--- keystore"
    echo "--- --- CA_private.pem"
    echo "--- --- CA_cert.pem"
    exit 1
}

if [ ! -e $FCU_CONFIG_DIR/factory_configurator_utility.zip ]; then
    echo "Couldn't find factory_configurator_utility.zip in $FCU_CONFIG_DIR"
    usage
fi

if [ ! -e $FCU_CONFIG_DIR/fcu.yml ]; then
    echo "Couldn't find fcu.yml in $FCU_CONFIG_DIR"
    usage
fi

if [ ! -d $FCU_CONFIG_DIR/keystore ]; then
    echo "Couldn't find certificate authority in $FCU_CONFIG_DIR"
    usage
fi

if [ ! -e $FCU_CONFIG_DIR/update-auth-certificate.der ]; then
    echo "WARN, No update auth certificate found!"
fi

echo "FCU configuration looks good, try installing it."
