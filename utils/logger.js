/*
 * Copyright (c) 2020, Arm Limited and affiliates.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const colors = require('colors');
const util = require('util');

let getDateTime = () => {
    let date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
};

 var logLevelEnum = {
    error : 0,
    warn : 1,
    info : 2,
    debug : 3,
    trace : 4,
    '*': 3
};

process.env.LOG_LEVEL = process.env.LOG_LEVEL || process.env.DEBUG || "info";

class Logger {
    constructor(options) {

        this._logLevel = logLevelEnum[process.env.LOG_LEVEL.toLowerCase()];

        this._moduleName = 'unknown';
        if(typeof options.moduleName != 'undefined')
            this._moduleName = options.moduleName;

        this.color = colors.white;
        if(typeof options.color != 'undefined') {
            this.color = colors[options.color];
        }

    }

    log_level(level) {
        this._logLevel = logLevelEnum[level.toLowerCase()];
    }

    error() {
        if(typeof this._logLevel != 'undefined' && this._logLevel >= 0) {
            if (arguments[0]) {
                arguments[0] = '[' + getDateTime() + '] - ' + this._moduleName + ' - ERROR - ' + arguments[0];
            }
            console.error(colors.red(util.format.apply(util, arguments)));
        }
    }

    warn() {
        if(typeof this._logLevel != 'undefined' && this._logLevel >= 1) {
            if (arguments[0]) {
                arguments[0] = '[' + getDateTime() + '] - ' + this._moduleName + ' - WARN - ' + arguments[0];
            }
            console.warn(colors.yellow(util.format.apply(util, arguments)));
        }
    }

    info() {
        if(typeof this._logLevel != 'undefined' && this._logLevel >= 2) {
            if (arguments[0]) {
                arguments[0] = '[' + getDateTime() + '] - ' + this._moduleName + ' - INFO - ' + arguments[0];
            }
            console.log(util.format.apply(util, arguments));
        }
    }

    debug() {
        if(typeof this._logLevel != 'undefined' && this._logLevel >= 3) {
            if (arguments[0]) {
                arguments[0] = '[' + getDateTime() + '] - ' + this._moduleName + ' - DEBUG - ' + arguments[0];
            }
            console.log(colors.magenta(util.format.apply(util, arguments)));
        }
    }

    trace() {
        if(typeof this._logLevel != 'undefined' && this._logLevel >= 4) {
            if (arguments[0]) {
                arguments[0] = '[' + getDateTime() + '] - ' + this._moduleName + ' - TRACE - ' + arguments[0];
            }
            console.trace(colors.grey(util.format.apply(util, arguments)));
        }
    }
}

module.exports = Logger;