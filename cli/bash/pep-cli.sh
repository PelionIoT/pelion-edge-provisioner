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

if [ -z "$(readlink $0)" ]; then
  export PEP_CLI_DIR=$(cd $(dirname $0) && pwd)
else
  export PEP_CLI_DIR=$(cd $(dirname $(readlink $0)) && pwd)
fi

. "$PEP_CLI_DIR/common.sh"

cli_help() {
  cli_name=${0##*/}
  echo "
$cli_name - pelion-edge-provisioner cli
Version: $(cat $PEP_CLI_DIR/VERSION)
Usage: pep [options] command {args...}

Options:
  -V, --version                    output the version number
  -h, --help                       output usage information

Commands:
  get-one-identity [<options>]     get a gateway identity based on the provided filters
  get-enrollment-id [<options>]    get enrollment identity of dispatched gateway
  help                             display help"
  exit 1
}

export API_VERSION="v3"
export PEP_SERVER_URL=${PEP_SERVER_URL:-"http://localhost:5151"}

case "$1" in
  get-one-identity)
    "$PEP_CLI_DIR/commands/get-one-identity.sh" $@
    ;;
  get-enrollment-id)
    "$PEP_CLI_DIR/commands/get-enrollment-id.sh" $@
    ;;
  -V|--version)
    echo "Version: $(cat $PEP_CLI_DIR/VERSION)"
    ;;
  *)
    cli_help
    ;;
esac