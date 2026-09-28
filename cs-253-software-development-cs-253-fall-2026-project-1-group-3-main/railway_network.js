/**
 * @fileoverview Server for the "network" part of the Railway API. It answers
 * questions about a whole railway network: its name, its routes, how many
 * stations it has, and which route is the longest.
 * Listens on port 3000 inside the pod.
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const express = require('express');
const {readNetwork, routeDistance, routeToString} = require('./shared.js');

const PORT = 3000;
const app = express();
app.use(express.json()); // lets POST endpoints read a JSON body

/** @type {?Object} The network loaded by /readNetwork. */
let network = null;

/**
 * Returns the names of the routes, in file order.
 * @return {!Array<string>} The route names.
 */
function getRouteNames() {
  return network.routes.map((route) => route.name);
}

/**
 * Counts the stations in a network. A station on several routes has the
 * same stationID on each one, so it is counted only once.
 * @param {!Object} data A railway network.
 * @return {number} The number of different stations.
 */
function totalStations(data) {
  const stationIds = new Set();
  for (const route of data.routes) {
    for (const stop of route.stops) {
      stationIds.add(stop.stationID);
    }
  }
  return stationIds.size;
}

/**
 * Finds the longest route without reordering the routes. On a tie the first
 * of the tied routes is returned.
 * @return {!Object} The longest route.
 */
function findLongestRoute() {
  let longest = network.routes[0];
  for (const route of network.routes) {
    if (routeDistance(route) > routeDistance(longest)) {
      longest = route;
    }
  }
  return longest;
}

/**
 * GET /readNetwork?fileName=uk.json
 * Loads the network file. Responds with the network, or null if the file
 * cannot be read or parsed.
 */
app.get('/readNetwork', (req, res) => {
  network = readNetwork(req.query.fileName);
  res.json(network);
});

/** GET /getNetworkName (Test 1): responds with the network's name. */
app.get('/getNetworkName', (req, res) => res.send(network.networkName));

/** GET /getRoutes (Test 2): responds with the array of route objects. */
app.get('/getRoutes', (req, res) => res.json(network.routes));

/** GET /getRouteNames (Test 3): responds with an array of the route names. */
app.get('/getRouteNames', (req, res) => res.json(getRouteNames()));

/**
 * GET /routeNamesToString (Test 4): responds with the route names, one per
 * line, with a comma after every name but the last.
 */
app.get('/routeNamesToString', (req, res) => {
  res.send(getRouteNames().join(',\n'));
});

/** GET /totalStations (Test 5): responds with the number of stations. */
app.get('/totalStations', (req, res) => res.json(totalStations(network)));

/** GET /findLongestRoute (Test 6): responds with the longest route object. */
app.get('/findLongestRoute', (req, res) => res.json(findLongestRoute()));

/**
 * POST /routeToString (Test 6): the request body is a route object.
 * Responds with that route as text.
 */
app.post('/routeToString', (req, res) => res.send(routeToString(req.body)));

app.listen(PORT, () => {
  console.log(`railway_network.js listening on port ${PORT}`);
});
