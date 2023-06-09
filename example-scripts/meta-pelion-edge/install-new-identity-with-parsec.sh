#!/bin/bash
#
# Copyright (c) 2021, Arm Limited and affiliates.
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

#!/bin/bash

set -e

EDGE_GW_CONFIG_DIR="/userdata/edge_gw_config/"
IDENTITY_JSON_FILE="identity.json"
PDM_CRED_DIR="/userdata/mbed/mcc_config"
PDM_CRED_SUBDIR="/userdata/mbed/mcc_config/pst"

# Move the identity.json to location as per maestro config
mkdir -p "$EDGE_GW_CONFIG_DIR"
mv "$IDENTITY_JSON_FILE" "$EDGE_GW_CONFIG_DIR"
echo "Successfully installed identity.json at $EDGE_GW_CONFIG_DIR$IDENTITY_JSON_FILE"

[ -d "$PDM_CRED_SUBDIR" ] && echo "Found device management credentials in PSA trusted storage at $PDM_CRED_DIR." \
 || echo "Error: Failed to locate device management credentials at $PDM_CRED_SUBDIR does not exists."

echo "Done"
