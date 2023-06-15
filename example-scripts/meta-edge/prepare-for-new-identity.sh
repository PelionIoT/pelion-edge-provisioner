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

#!/bin/bash

set -e

if [[ "$EUID" -gt 0 ]]; then
  echo "This script must be run via sudo (or as root) - can't run systemctl mask commands otherwise."
  exit 1
fi

EDGE_GW_CONFIG_DIR="/userdata/edge_gw_config/"
PDM_CRED_DIR="/userdata/mbed/mcc_config"

# Halt edge-core's execution
systemctl mask edge-core
systemctl stop edge-core
echo "Stopped edge-core"

# Remove old device management credentials
rm -rf "$PDM_CRED_DIR"
echo "Cleared device management credentials ($PDM_CRED_DIR -directory)"

# Remove old identity.json
rm -rf "$EDGE_GW_CONFIG_DIR"
echo "Cleared identity.json ($EDGE_GW_CONFIG_DIR -directory)"

# -------------------------------------------------------------------
# meta-pelion-edge platform specifics
# -------------------------------------------------------------------
# Remove the gateway statistics generated from old provisioning data. This is used by info command
if [ -e "/wigwag/system/lib/bash/relaystatics.sh" ]; then
    rm -rf /wigwag/system/lib/bash/relaystatics.sh
    echo "Cleared relaystatics.sh"
fi

# Remove device database, be it a file or folder
# Edge 2.5.0/2.6.0 does not have this.
DEVICEDB="/userdata/etc/devicejs/db"
if [ -e "$DEVICEDB" ] || [ -d "$DEVICEDB" ]; then
    rm -rf "$DEVICEDB"
    echo "Cleared devicedb ($DEVICEDB -folder/file)"
fi

# Remove maestro database, be it a file or folder
MAESTRO="/userdata/etc/maestroConfig.db"
if [ -e "$MAESTRO" ] || [ -d "$MAESTRO" ]; then
    rm -rf "$MAESTRO"
    echo "Cleared maestro database ($MAESTRO -directory)"
fi

echo "Done"
