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

#!/bin/bash

set -e

if [ ! -z "$DEBUG" ]; then
    set -x
fi

. "$PEP_CLI_DIR/common.sh"

cli_help_get_verification_key() {
  echo "
Usage: pep get-verification-key [<options>]

Options:
  -s <string_value>  get verification-key of the gateway based on its serial number
  -v                 verbose
  -h                 output usage information"
}

[ ! -n "$2" ] && cli_help_get_verification_key && exit 1

OPTIND=2

while getopts 's:hv' opt; do
    case "$opt" in
        h|-help)
            cli_help_get_verification_key
            exit 0
            ;;
        s)
            SERIAL_NUMBER="$OPTARG"
            ;;
        v)
            VERBOSE="-v"
            ;;
        *)
            cli_help_get_verification_key
            exit 1
            ;;
    esac
done

shift "$(($OPTIND-1))"

if [ -z "$SERIAL_NUMBER" ]; then
    cli_error "-s <serial_number> not specified!"
    exit 1
fi


curl -G \
    --data-urlencode "serialNumber=$SERIAL_NUMBER" \
    $PEP_SERVER_URL/$API_VERSION/verification-key $VERBOSE