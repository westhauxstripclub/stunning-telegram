/**
 * @fileoverview Route summary client: loads a network file on the route
 * summary server and prints route summary tests 1-5.
 * Usage: node client_routeSummary.js uk.json
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:30601';

/**
 * Sends a GET request to the server.
 * @param {string} endpoint The endpoint, for example '/routeSummary'.
 * @param {!Object=} params The query parameters.
 * @return {!Promise<*>} The data the server sends back.
 */
async function get(endpoint, params) {
  const response = await axios.get(BASE_URL + endpoint, {params});
  return response.data;
}

/**
 * Prints the route summary tests for the file named on the command line.
 * @return {!Promise<void>}
 */
async function main() {
  const network = await get('/readNetwork', {file: process.argv[2]});
  if (!network) {
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

main();
