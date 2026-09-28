/**
 * @fileoverview Client for railway_network.js. It loads a railway network
 * file on the server, then prints network tests 1 to 6: the network name, the
 * routes, the route names, the number of stations, and the longest route.
 * Usage: node client_network.js uk.json
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

/** The network server, reached through the pod's published host port. */
const BASE_URL = 'http://localhost:30600';

/**
 * Sends a GET request to the server.
 * @param {string} path The endpoint, e.g. '/getRoutes'.
 * @param {!Object=} params Query-string parameters, if any.
 * @return {!Promise<*>} The response body.
 */
async function get(path, params) {
  return (await axios.get(BASE_URL + path, {params})).data;
}

/**
 * Loads the network file and prints the six network tests.
 * @param {string} fileName The railway network .json file.
 * @return {!Promise<void>}
 */
async function main(fileName) {
  const network = await get('/readNetwork', {fileName});
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
  const text = (await axios.post(`${BASE_URL}/routeToString`, longest)).data;
  console.log(`Longest route is: ${text}`);
}

main(process.argv[2]).catch((error) => console.log(`Error: ${error.message}`));
