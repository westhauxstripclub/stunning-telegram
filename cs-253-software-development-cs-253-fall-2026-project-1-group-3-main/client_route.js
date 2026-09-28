/**
 * @fileoverview client_route.js: the client for railway_route.js. It asks the
 * server to load a railway network file, then prints route tests 1-3 for one
 * route and bonus test 4 (a single route that has two given stops).
 * Usage: node client_route.js <file> <routeName> <startStop> <endStop>
 * Example: node client_route.js simpleton.json Simpleton Betaford Epsilon
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

// The host port that the pod maps to port 3002 (railway_route.js).
const BASE_URL = 'http://localhost:30602';

/**
 * Sends a GET request to the server and returns the data it sends back.
 * @param {string} endpoint The endpoint, for example '/getRoute'.
 * @param {!Object=} params The query parameters, if any.
 * @return {!Promise<*>} The data sent back by the server.
 */
async function get(endpoint, params) {
  const response = await axios.get(BASE_URL + endpoint, {params: params});
  return response.data;
}

/**
 * Loads the network file named on the command line and prints the tests.
 * @return {!Promise<void>}
 */
async function main() {
  const fileName = process.argv[2];
  const routeName = process.argv[3];
  const startStop = process.argv[4];
  const endStop = process.argv[5];

  const network = await get('/readNetwork', {file: fileName});
  if (network == null) {
    console.log('Not able to parse the input file.');
    return;
  }
  console.log('ROUTE Tests');

  console.log('\n===Route TEST=1=GET=ROUTE===');
  const route = await get('/getRoute', {routeName: routeName});
  console.log('Found: ' + route.name);

  console.log('\n===Route TEST=2=ROUTE=TO=STRING===');
  console.log(await get('/routeToString', {routeName: routeName}));

  console.log('\n===Route TEST=3=ROUTE=DISTANCE===');
  const distance = await get('/routeDistance', {routeName: routeName});
  console.log('Distance of Line as calculated: ' + distance);

  console.log('\n====(OPTIONAL) Route TEST=4=BONUS1=FIND=FROM=TO===');
  const stops = {startStop: startStop, endStop: endStop};
  console.log(await get('/findRoute', stops));
}

main().catch((error) => console.log(error.message));
