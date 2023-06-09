#!/bin/bash
#
# Copyright (c) 2020, Arm Limited and affiliates.
# Copyright (c) 2023, Izuma Networks
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

if [ -n "$DEBUG" ]; then
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

[ -z "$2" ] && cli_help_get_enrollment_id && exit 1

OPTIND=2

while getopts 's:hv' opt; do
    case "$opt" in
        h)
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
            if [[ "$opt" == "-help" ]]; then
                cli_help_get_enrollment_id
                exit 0
            else
                cli_help_get_enrollment_id
                exit 1
            fi
            ;;
    esac
done

shift OPTIND-1

if [ -z "$SERIAL_NUMBER" ]; then
    cli_error "-s <serial_number> not specified!"
    exit 1
fi


curl -G \
    --data-urlencode "serialNumber=$SERIAL_NUMBER" \
    "$PEP_SERVER_URL/$API_VERSION/enrollment-id" "$VERBOSE"
