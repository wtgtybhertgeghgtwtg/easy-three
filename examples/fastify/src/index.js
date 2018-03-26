// @flow
import dotenv from 'dotenv';
import init from 'easy-three';
import path from 'path';
import configMap from './configMap';
import start from './start';

// Add the environmental variables.
dotenv.config({path: path.resolve(process.cwd(), 'sample-env')});
// Start the thing.
init(configMap, start);
