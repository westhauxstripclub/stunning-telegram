/**
 * @fileoverview Client for railway_route.js. It loads a railway network file
 * on the server, then prints route tests 1 to 3 for one route (find it, print
 * it, measure it) and bonus test 4 (a single route between two stations).
 * Usage: node client_route.js <file.json> <routeName> <startStop> <endStop>
 * e.g.   node client_route.js simpleton.json Simpleton Betaford Epsilon
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const axios = require('axios');

/** The route server, reached through the pod's published host port. */
const BASE_URL = 'http://localhost:30602';

/**
 * Sends a GET request to the server.
 * @param {string} path The endpoint, e.g. '/getRoute'.
 * @param {!Object=} params Query-string parameters, if any.
 * @return {!Promise<*>} The response body.
 */
async function get(path, params) {
  return (await axios.get(BASE_URL + path, {params})).data;
}

/**
 * Loads the network file and prints the route tests.
 * @param {string} fileName The railway network .json file.
 * @param {string} routeName The route used in tests 1 to 3.
 * @param {string} startStop The first station for the bonus test.
 * @param {string} endStop The second station for the bonus test.
 * @return {!Promise<void>}
 */
async function main(fileName, routeName, startStop, endStop) {
  const network = await get('/readNetwork', {fileName});
  if (!network) {
    console.log('Not able to parse the input file.');
    return;
  }
  console.log('ROUTE Tests');

  console.log('\n===Route TEST=1=GET=ROUTE===');
  const route = await get('/getRoute', {routeName});
  if (!route) {
    console.log(`No route named ${routeName}`);
    return;
  }
  console.log(`Found: ${route.name}`);

  console.log('\n===Route TEST=2=ROUTE=TO=STRING===');
  console.log((await axios.post(`${BASE_URL}/routeToString`, route)).data);

  console.log('\n===Route TEST=3=ROUTE=DISTANCE===');
  const miles = (await axios.post(`${BASE_URL}/routeDistance`, route)).data;
  console.log(`Distance of Line as calculated: ${miles}`);

  console.log('\n====(OPTIONAL) Route TEST=4=BONUS1=FIND=FROM=TO===');
  console.log(await get('/findRoute', {startStop, endStop}));
}

main(...process.argv.slice(2)).catch((error) => {
  console.log(`Error: ${error.message}`);
});
