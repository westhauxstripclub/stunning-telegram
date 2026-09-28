/**
 * @fileoverview Network client: loads a network file on the network server
 * and prints network tests 1-6. Usage: node client_network.js uk.json
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:30600';

/**
 * Sends a GET request to the server.
 * @param {string} endpoint The endpoint, for example '/getRoutes'.
 * @param {!Object=} params The query parameters.
 * @return {!Promise<*>} The data the server sends back.
 */
async function get(endpoint, params) {
  const response = await axios.get(BASE_URL + endpoint, {params});
  return response.data;
}

/**
 * Prints the network tests for the file named on the command line.
 * @return {!Promise<void>}
 */
async function main() {
  const network = await get('/readNetwork', {file: process.argv[2]});
  if (!network) {
    console.log('Not able to parse the input file.');
    return;
  }
  console.log('NETWORK Tests');

  console.log('\n===Network TEST=1=NETWORK=NAME===');
  console.log(await get('/getNetworkName'));

  console.log('\n===Network TEST=2=GETTING=ROUTES=ARRAY===');
  const routes = await get('/getRoutes');
  console.log(`There are ${routes.length} routes on this network`);
  console.log(`The type of the routes is ${typeof routes}`);

  console.log('\n===Network TEST=3=ROUTE=NAMES===');
  console.log(await get('/getRouteNames'));

  console.log('\n===Network TEST=4=ROUTE=NAMES=TOSTRING===');
  console.log(await get('/routeNamesToString'));

  console.log('\n===Network TEST=5=Total_Stations===');
  const stations = await get('/totalStations');
  console.log(`There are ${stations} stations in this network.`);

  console.log('\n===Network TEST=6=FIND=LONGEST=ROUTE===');
  const longest = await get('/findLongestRoute');
  const text = await get('/routeToString', {routeName: longest.name});
  console.log(`Longest route is: ${text}`);
}

main();
