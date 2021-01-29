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
echo "Installing fcu configuration - $FCU_CONFIG_DIR"

ls $FCU_CONFIG_DIR

FCU_ARCHIVE_DIR=/opt/fcu-package
FCU_VIRTUAL_ENV=/opt/fcu-ve

mkdir -p $FCU_ARCHIVE_DIR
mkdir -p $FCU_VIRTUAL_ENV

# Extract the FCU archive
echo "Extracting the fcu archive to $FCU_ARCHIVE_DIR"
unzip -o $dir/$FCU_CONFIG_DIR/factory_configurator_utility.zip -d $FCU_ARCHIVE_DIR

echo "Setting up virtual environment to $FCU_VIRTUAL_ENV"
python3 -m virtualenv $FCU_VIRTUAL_ENV

$FCU_VIRTUAL_ENV/bin/pip --version
$FCU_VIRTUAL_ENV/bin/pip install --upgrade pip

install_package_command="$FCU_VIRTUAL_ENV/bin/pip install fcu -f $FCU_ARCHIVE_DIR/fcu --upgrade"
echo "Installing the fcu python packages using command - $install_package_command"

$install_package_command
if [ $? -ne 0 ]; then
    echo "Failed to install FCU packages!"
    exit 1
else
    echo "FCU tool is installed succesfully!"
fi

echo "Copying the fcu.yml provided in the configuration_dir=$FCU_CONFIG_DIR"
cp $FCU_CONFIG_DIR/fcu.yml $FCU_ARCHIVE_DIR/config/

if [ -d $FCU_CONFIG_DIR/keystore ]; then
    echo "CA is provided, copying it to fcu keystore"
    mkdir -p $FCU_ARCHIVE_DIR/keystore
    cp -R $FCU_CONFIG_DIR/keystore/CA_cert.pem $FCU_ARCHIVE_DIR/keystore/fcu.crt
    cp -R $FCU_CONFIG_DIR/keystore/CA_private.pem $FCU_ARCHIVE_DIR/keystore/fcu_private_key.pem
    ls $FCU_ARCHIVE_DIR/keystore
fi

if [ -e $FCU_CONFIG_DIR/update-auth-certificate.der ]; then
    echo "Found firmware update certificate, adding this to the fcu resources"
    cp $FCU_CONFIG_DIR/update-auth-certificate.der $FCU_ARCHIVE_DIR/resources/update-auth-certificate.der
else
    echo "WARN, No update auth certificate found!"
fi

echo "Installing the python requirements for ft_demo tool..."
$FCU_VIRTUAL_ENV/bin/pip install -r $FCU_ARCHIVE_DIR/ft_demo/sources/requirements.txt --upgrade

echo "FCU is succesfully installed!"