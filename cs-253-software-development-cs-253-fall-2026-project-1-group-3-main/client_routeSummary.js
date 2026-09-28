/**
 * @fileoverview Client for railway_routeSummary.js. It loads a railway
 * network file on the server, then prints route summary tests 1 to 5: the
 * summary in file order, sorted by name (A to Z, Z to A), and sorted by
 * length (shortest first, longest first).
 * Usage: node client_routeSummary.js uk.json
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

/** The route summary server, reached through the pod's published host port. */
const BASE_URL = 'http://localhost:30601';

/**
 * Sends a GET request to the server.
 * @param {string} path The endpoint, e.g. '/routeSummary'.
 * @param {!Object=} params Query-string parameters, if any.
 * @return {!Promise<*>} The response body.
 */
async function get(path, params) {
  return (await axios.get(BASE_URL + path, {params})).data;
}

/**
 * Loads the network file and prints the five route summary tests.
 * @param {string} fileName The railway network .json file.
 * @return {!Promise<void>}
 */
async function main(fileName) {
  const network = await get('/readNetwork', {fileName});
  if (!network) {
    console.log('Not able to parse the input file.');
    return;
  }
  console.log('ROUTE SUMMARY Tests');

  console.log('\n===Route Summary TEST=1=ROUTE=SUMMARY===');
  console.log(await get('/routeSummary'));

  console.log('\n===Route Summary TEST=2=SORT=ROUTE=BY=NAME=(ASC)===');
  console.log(await get('/routeSummary', {sortBy: 'name', ascending: true}));

  console.log('\n===Route Summary TEST=3=SORT=ROUTE=BY=NAME=(DESC)===');
  console.log(await get('/routeSummary', {sortBy: 'name', ascending: false}));

  console.log('\n===Route Summary TEST=4=SORT=ROUTE=BY=LENGTH=(ASC)===');
  console.log(await get('/routeSummary', {sortBy: 'length', ascending: true}));

  console.log('\n===Route Summary TEST=5=SORT=ROUTE=BY=LENGTH=(DESC)===');
  console.log(await get('/routeSummary', {sortBy: 'length', ascending: false}));
}

main(process.argv[2]).catch((error) => console.log(`Error: ${error.message}`));
