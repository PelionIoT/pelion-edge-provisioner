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

#!/bin/bash

set -e

if [ -n "$DEBUG" ]; then
    set -x
fi

. "$PEP_CLI_DIR/common.sh"

cli_help_create_one_identity() {
  echo "
Usage: pep create-one-identity [<options>]

Options:
  -a <ip_or_dns>        pelion cloud api url (default: 'https://api.us-east-1.mbedcloud.com')
  -g <ip_or_dns>        pelion cloud gateway service address (default: 'https://gateways.us-east-1.mbedcloud.com')
  -s <string_value>     serial number of the gateway
  -w <string_value>     hardware version of the gateway, refer configurations section in
                        $PEP_CLI_DIR/../lib/radioProfile.template.json
  -r <string_value>     radio configuration of the gateway, refer configurations section in
                        $PEP_CLI_DIR/../lib/radioProfile.template.json (default: '00')
  -l <string_value>     status led configuration of the gateway (default: '01')
  -c <string_value>     developer or production (default: 'production')
  -v                    verbose
  -h                    output usage information"
}

[ ! -n "$2" ] && cli_help_create_one_identity && exit 1

OPTIND=1

API_URL="https://api.us-east-1.mbedcloud.com"
GW_URL="https://gateways.us-east-1.mbedcloud.com"
RADIO_CONFIG="00"
LED_CONFIG="01"
CATEGORY="production"

while getopts 'a:g:s:w:r:l:c:hv' opt "${@:2}"; do
    case "$opt" in
        h|-help)
            cli_help_create_one_identity
            exit 0
            ;;
        a)
            API_URL="$OPTARG"
            ;;
        g)
            GW_URL="$OPTARG"
            ;;
        s)
            SERIAL_NUMBER="$OPTARG"
            ;;
        w)
            HW_VERSION="$OPTARG"
            ;;
        r)
            RADIO_CONFIG="$OPTARG"
            ;;
        l)
            LED_CONFIG="$OPTARG"
            ;;
        c)
            CATEGORY="$OPTARG"
            ;;
        v)
            VERBOSE="-v"
            ;;
        *)
            cli_help_create_one_identity
            exit 1
            ;;
    esac
done

shift "$(($OPTIND-1))"

if [ -z "$SERIAL_NUMBER" ]; then
    cli_error "-s <serial_number> not specified!"
    exit 1
fi

if [ -z "$HW_VERSION" ]; then
    cli_error "-w <hardware_version> not specified!"
    exit 1
fi

curl -d \
 "{\"serialNumber\": \"$SERIAL_NUMBER\",\
 \"hardwareVersion\": \"$HW_VERSION\",\
 \"radioConfig\": \"$RADIO_CONFIG\",\
 \"ledConfig\": \"$LED_CONFIG\",\
 \"category\": \"$CATEGORY\",\
 \"gatewayServicesAddress\": \"$GW_URL\",\
 \"apiAddress\": \"$API_URL\",\
 \"cloudAddress\": \"$GW_URL\"}"\
 -H "Content-Type: application/json"\
 $PEP_SERVER_URL/$API_VERSION/identity $VERBOSE
