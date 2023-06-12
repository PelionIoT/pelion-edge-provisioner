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

FROM ubuntu:focal

WORKDIR /usr/local/src

ARG fcu_config

# Add the rest of the files
COPY . .

# Validate the provided fcu configuration
RUN ./fcu-config-validator.sh "$fcu_config"

RUN apt-get update && apt-get install -y \
    ssh \
    curl \
    unzip \
    iputils-ping \
    software-properties-common

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get update && apt-get install -y \
    nodejs

# Installing package dependencies of the tool
RUN npm install

# To setup virtual environment
RUN apt-get update && apt-get install -y \
    python3-distutils

RUN curl https://bootstrap.pypa.io/get-pip.py -O && python3 get-pip.py
RUN python3 -m pip install virtualenv

# Install fcu
RUN ./fcu-installer.sh "$fcu_config"

CMD [ "node", "./api-server/index.js" ]

EXPOSE 5151
