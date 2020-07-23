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

cli_help_get_enrollment_id() {
  echo "
Usage: pep get-enrollment-id [<options>]

Options:
  -s <string_value>  get enrollment-id of the gateway based on its serial number
  -v                 verbose
  -h                 output usage information"
}

[ ! -n "$2" ] && cli_help_get_enrollment_id && exit 1

OPTIND=1

while getopts 's:hv' opt "${@:2}"; do
    case "$opt" in
        h|-help)
            cli_help_get_enrollment_id
            exit 0
            ;;
        s)
            SERIAL_NUMBER="$OPTARG"
            ;;
        v)
            VERBOSE="-v"
            ;;
        *)
            cli_help_get_enrollment_id
            exit 1
            ;;
    esac
done

shift "$(($OPTIND-1))"

if [ -z "$SERIAL_NUMBER" ]; then
    cli_error "-s <serial_number> not specified!"
    exit 1
fi

curl $PEP_SERVER_URL/$API_VERSION/enrollment-id?serialNumber=$SERIAL_NUMBER $VERBOSE