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

EDGE_GW_CONFIG_DIR="/userdata/edge_gw_config/"
PDM_CRED_DIR="/userdata/mbed/mcc_config"

# Halt edge-core's execution
systemctl stop edge-core
echo "Stopped edge-core"

# Remove old device management credentials
rm -rf $PDM_CRED_DIR
echo "Cleared device management credentials"

# Remove old identity.json
rm -rf $EDGE_GW_CONFIG_DIR
echo "Cleared identity.json"

# -------------------------------------------------------------------
# meta-pelion-edge platform specifics
# -------------------------------------------------------------------
# Remove the gateway statistics generated from old provisioning data. This is used by info command
rm -rf /wigwag/system/lib/bash/relaystatics.sh
echo "Cleared relaystatics.sh"

# Remove device database
rm -rf /userdata/etc/devicejs/db
echo "Cleared devicedb"

# Remove maestro database
rm -rf /userdata/etc/maestroConfig.db
echo "Cleared maestro database"

echo "Done"