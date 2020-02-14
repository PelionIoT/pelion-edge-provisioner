/*
 * Copyright (c) 2019, Arm Limited and affiliates.
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

const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const jsonminify = require('jsonminify');
const mongoose = require('mongoose');

//Logger
const Logger = require('./../utils/logger');
const logger = new Logger( {moduleName: 'pep-api-server-main', color: 'bgBlue'} );

//Configuration
const config = JSON.parse(jsonminify(fs.readFileSync(__dirname + '/config.json', 'utf8')));
const port = config.port || 5151;
global.rdLogLevel = config.logLevel || 2;

require('./api/models/v3/identity');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongo_db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

var db = mongoose.connection;
db.on('error', function(err) {
    logger.error('Failed to connect to ' + config.mongo_db_uri + ' error ', err);
});
db.once('open', function() {
    logger.info('Connected to ' + config.mongo_db_uri + ' successfully!');
});

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse requests of content-type - application/json
app.use(bodyParser.json());

app.enable('trust proxy');

//register the routes
try {
    app.use(require('./api/routes'));
} catch(err) {
    logger.error('Could not load routes ' + JSON.stringify(err));
    console.log(err);
    process.exit(1);
}

app.listen(port);

logger.info('pep-api-server RESTful API server started on: ' + port);
