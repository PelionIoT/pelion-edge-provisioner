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

if [ ! -z "$DEBUG" ]; then
    set -x
fi

. "$PEP_CLI_DIR/common.sh"

ORDER="DESC"
LIMIT=50
LAST=''
OUTPUT_FILE="enrollment_ids_list"
EXPORT_FORMAT=''

cli_help_list_enrollment_ids() {
  echo "
Usage: pep list-enrollment-ids [<options>]

Options:
  -l <number_value>  number of results to return, default: 50, maximum: 1000
  -o <string_value>  order - ASC or DESC, default: DESC
  -t <string_value>  the id of the last entry in the previous result. Used to mark the start of the next page.
  -e <string_value>  define the export format of the result. By default result is stored in JSON format at $OUTPUT_JSON_FILE.
                     Other supported formats are - csv.
  -f <string_value>  output file, default=$OUTPUT_FILE
  -v                 verbose
  -h                 output usage information"
}

OPTIND=1

while getopts 'l:o:t:e:f:hv' opt "${@:2}"; do
    case "$opt" in
        h|-help)
            cli_help_list_enrollment_ids
            exit 0
            ;;
        l)
            LIMIT="$OPTARG"
            ;;
        o)
            ORDER="$OPTARG"
            ;;
        t)
            LAST="$OPTARG"
            ;;
        e)
            EXPORT_FORMAT="$OPTARG"
            ;;
        f)
            OUTPUT_FILE="$OPTARG"
            ;;
        v)
            VERBOSE="-v"
            ;;
        *)
            cli_help_list_enrollment_ids
            exit 1
            ;;
    esac
done

shift "$(($OPTIND-1))"

curl $PEP_SERVER_URL/$API_VERSION/enrollment-ids?"order=$ORDER&limit=$LIMIT&last=$LAST" $VERBOSE > $OUTPUT_FILE".json"
echo "JSON output saved successfully at $OUTPUT_FILE.json"

if [[ "$EXPORT_FORMAT" = "csv" ]]; then

    if [ $(command -v jq &>/dev/null) ]; then
        echo "jq not found, please install jq for csv export to work!"
        exit 1
    fi

    jq -r '["enrollmentID","serialNumber","gatewayServicesAddress","apiAddress","hardwareVersion","radioConfig","ledConfig",
    "category","deployed","createdAt"], (.results[] | [.enrollmentID, .serialNumber,.gatewayServicesAddress,.apiAddress,
    .hardwareVersion,.radioConfig,.ledConfig,.category,.deployed,.createdAt]) | @csv' $OUTPUT_FILE".json" > $OUTPUT_FILE".csv"

    echo "CSV output saved successfully at $OUTPUT_FILE.csv"
fi