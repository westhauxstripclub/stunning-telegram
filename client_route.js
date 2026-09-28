/**
 * @fileoverview Route client: loads a network file on the route server and
 * prints route tests 1-3 for one route, and bonus test 4 for two stops.
 * Usage: node client_route.js simpleton.json Simpleton Betaford Epsilon
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:30602';

/**
 * Sends a GET request to the server.
 * @param {string} endpoint The endpoint, for example '/getRoute'.
 * @param {!Object=} params The query parameters.
 * @return {!Promise<*>} The data the server sends back.
 */
async function get(endpoint, params) {
  const response = await axios.get(BASE_URL + endpoint, {params});
  return response.data;
}

/**
 * Prints the route tests for the command-line arguments: a file, a route
 * name, and two stops.
 * @return {!Promise<void>}
 */
async function main() {
  const fileName = process.argv[2];
  const routeName = process.argv[3];
  const startStop = process.argv[4];
  const endStop = process.argv[5];

  const network = await get('/readNetwork', {file: fileName});
  if (!network) {
    console.log('Not able to parse the input file.');
    return;
  }
  console.log('ROUTE Tests');

  console.log('\n===Route TEST=1=GET=ROUTE===');
  const route = await get('/getRoute', {routeName});
  console.log(`Found: ${route.name}`);

  console.log('\n===Route TEST=2=ROUTE=TO=STRING===');
  console.log(await get('/routeToString', {routeName}));

  console.log('\n===Route TEST=3=ROUTE=DISTANCE===');
  const distance = await get('/routeDistance', {routeName});
  console.log(`Distance of Line as calculated: ${distance}`);

  console.log('\n====(OPTIONAL) Route TEST=4=BONUS1=FIND=FROM=TO===');
  console.log(await get('/findRoute', {startStop, endStop}));
}

main();
