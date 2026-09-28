/**
 * @fileoverview client_routeSummary.js: the client for railway_routeSummary.js.
 * It asks the server to load a railway network file, then prints route summary
 * tests 1-5: unsorted, sorted by name (A-Z, Z-A), and by length (short, long).
 * Usage: node client_routeSummary.js uk.json
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

// The host port that the pod maps to port 3001 (railway_routeSummary.js).
const BASE_URL = 'http://localhost:30601';

/**
 * Sends a GET request to the server and returns the data it sends back.
 * @param {string} endpoint The endpoint, for example '/routeSummary'.
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
  console.log('ROUTE SUMMARY Tests');

  console.log('\n===Route Summary TEST=1=ROUTE=SUMMARY===');
  console.log(await get('/routeSummary'));

  console.log('\n===Route Summary TEST=2=SORT=ROUTE=BY=NAME=(ASC)===');
  await get('/sortRoutesByName', {ascending: true});
  console.log(await get('/routeSummary'));

  console.log('\n===Route Summary TEST=3=SORT=ROUTE=BY=NAME=(DESC)===');
  await get('/sortRoutesByName', {ascending: false});
  console.log(await get('/routeSummary'));

  console.log('\n===Route Summary TEST=4=SORT=ROUTE=BY=LENGTH=(ASC)===');
  await get('/sortRoutesByLength', {ascending: true});
  console.log(await get('/routeSummary'));

  console.log('\n===Route Summary TEST=5=SORT=ROUTE=BY=LENGTH=(DESC)===');
  await get('/sortRoutesByLength', {ascending: false});
  console.log(await get('/routeSummary'));
}

main().catch((error) => console.log(error.message));
