/**
 * @fileoverview client_network.js: the client for railway_network.js. It asks
 * the server to load a railway network file, then prints network tests 1-6.
 * Usage: node client_network.js uk.json
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

// The host port that the pod maps to port 3000 (railway_network.js).
const BASE_URL = 'http://localhost:30600';

/**
 * Sends a GET request to the server and returns the data it sends back.
 * @param {string} endpoint The endpoint, for example '/getRoutes'.
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
  const network = await get('/readNetwork', {file: process.argv[2]});
  if (network == null) {
    console.log('Not able to parse the input file.');
    return;
  }
  console.log('NETWORK Tests');

  console.log('\n===Network TEST=1=NETWORK=NAME===');
  console.log(await get('/getNetworkName'));

  console.log('\n===Network TEST=2=GETTING=ROUTES=ARRAY===');
  const routes = await get('/getRoutes');
  console.log('There are ' + routes.length + ' routes on this network');
  console.log('The type of the routes is ' + typeof routes);

  console.log('\n===Network TEST=3=ROUTE=NAMES===');
  console.log(await get('/getRouteNames'));

  console.log('\n===Network TEST=4=ROUTE=NAMES=TOSTRING===');
  console.log(await get('/routeNamesToString'));

  console.log('\n===Network TEST=5=Total_Stations===');
  const stations = await get('/totalStations');
  console.log('There are ' + stations + ' stations in this network.');

  console.log('\n===Network TEST=6=FIND=LONGEST=ROUTE===');
  const longest = await get('/findLongestRoute');
  const text = await get('/routeToString', {routeName: longest.name});
  console.log('Longest route is: ' + text);
}

main().catch((error) => console.log(error.message));
