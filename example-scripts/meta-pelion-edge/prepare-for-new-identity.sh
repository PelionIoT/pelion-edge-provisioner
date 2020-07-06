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

# Halt edge-core's execution
systemctl stop edge-core

# Remove old device management credentials
rm -rf /userdata/mbed/mcc_config

# Remove old identit.json
rm -rf /userdata/edge_gw_config

# meta-pelion-edge platform specifics
# Remove the gateway statistics generated from old provisioning data. This is used by info command
rm -rf /wigwag/system/lib/bash/relaystatics.sh