#!/bin/bash

# Copyright (c) 2019, Arm Limited and affiliates.
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

self_signed_certs_path=$1

cleanup () {
    rm -rf $self_signed_certs_path
}

_createRootPrivateKey() {
    openssl ecparam -out $self_signed_certs_path/root_key.pem -name prime256v1 -genkey
}
_createRootCA() {
    (echo '[ req ]'; echo 'distinguished_name=dn'; echo 'prompt = no'; echo '[ ext ]'; echo 'basicConstraints = CA:TRUE'; echo 'keyUsage = digitalSignature, keyCertSign, cRLSign'; echo '[ dn ]') > $self_signed_certs_path/ca_config.cnf
    (cat $self_signed_certs_path/ca_config.cnf; echo 'C=US'; echo 'ST=Texas';echo 'L=Austin';echo 'O=ARM';echo 'CN=gateways_arm.io_gateway_ca';) > $self_signed_certs_path/root.cnf
    openssl req -key $self_signed_certs_path/root_key.pem -new -sha256 -x509 -days 12775 -out $self_signed_certs_path/root_cert.pem -config $self_signed_certs_path/root.cnf -extensions ext
}
_createIntermediatePrivateKey() {
    openssl ecparam -out $self_signed_certs_path/intermediate_key.pem -name prime256v1 -genkey
}
_createIntermediateCA() {
    (cat $self_signed_certs_path/ca_config.cnf; echo 'C=US'; echo 'ST=Texas'; echo 'L=Austin';echo 'O=ARM';echo 'CN=gateways_arm.io_gateway_ca_intermediate';) > $self_signed_certs_path/int.cnf
    openssl req -new -sha256 -key $self_signed_certs_path/intermediate_key.pem -out $self_signed_certs_path/intermediate_csr.pem  -config $self_signed_certs_path/int.cnf
    openssl x509 -sha256 -req -in $self_signed_certs_path/intermediate_csr.pem -out $self_signed_certs_path/intermediate_cert.pem -CA $self_signed_certs_path/root_cert.pem -CAkey $self_signed_certs_path/root_key.pem -days 7300 -extfile $self_signed_certs_path/ca_config.cnf -extensions ext -CAcreateserial
}
_createDevicePrivateKey() {
    openssl ecparam -out $self_signed_certs_path/device_private_key.pem -name prime256v1 -genkey
}
_createDeviceCertificate() {
    (echo '[ req ]'; echo 'distinguished_name=dn'; echo 'prompt = no'; echo '[ dn ]'; echo 'C=US'; echo 'ST=Texas';echo 'L=Austin';echo 'O=ARM';) > $self_signed_certs_path/device.cnf
    openssl req -key $self_signed_certs_path/device_private_key.pem -new -sha256 -out $self_signed_certs_path/device_csr.pem -config $self_signed_certs_path/device.cnf
    openssl x509 -sha256 -req -in $self_signed_certs_path/device_csr.pem -out $self_signed_certs_path/device_cert.pem -CA $self_signed_certs_path/intermediate_cert.pem -CAkey $self_signed_certs_path/intermediate_key.pem -days 7300 -extensions ext -CAcreateserial
}

generate_self_signed_certs() {
    mkdir -p $self_signed_certs_path
    _createRootPrivateKey
    _createRootCA
    _createIntermediatePrivateKey
    _createIntermediateCA
    _createDevicePrivateKey
    _createDeviceCertificate
}

generate_self_signed_certs