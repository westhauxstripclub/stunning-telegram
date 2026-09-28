/**
 * @fileoverview Server for the "route" part of the Railway API. It answers
 * questions about one route, found by its name, and (bonus) finds a single
 * route that connects two stations. Listens on port 3002 inside the pod.
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const express = require('express');
const {readNetwork, routeDistance, routeToString} = require('./shared.js');

const PORT = 3002;
const app = express();
app.use(express.json()); // lets POST endpoints read a JSON body

/** @type {?Object} The network loaded by /readNetwork. */
let network = null;

/**
 * Bonus: finds a single route that stops at both stations and describes the
 * trip between them. If several routes do, the last one in the file is used
 * (that is what the smokey.json sample output shows).
 * @param {string} startStop Name of the station the trip starts at.
 * @param {string} endStop Name of the station the trip ends at.
 * @return {string} e.g. "Simpleton Betaford to Epsilon 3 stops and 75 miles",
 *     or "No direct route found from Elton to Bury".
 */
function findRoute(startStop, endStop) {
  for (const route of [...network.routes].reverse()) {
    const names = route.stops.map((stop) => stop.stationName);
    const from = names.indexOf(startStop);
    const to = names.indexOf(endStop);
    if (from !== -1 && to !== -1) {
      // Each stop from the first station up to the second is one leg.
      const legs = route.stops.slice(Math.min(from, to), Math.max(from, to));
      const miles = legs.reduce((sum, stop) => sum + stop.distanceToNext, 0);
      const stops = legs.length === 1 ? '1 stop' : `${legs.length} stops`;
      return `${route.name} ${startStop} to ${endStop} ` +
          `${stops} and ${miles} miles`;
    }
  }
  return `No direct route found from ${startStop} to ${endStop}`;
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

/**
 * GET /getRoute?routeName=Simpleton (Test 1)
 * Responds with the route object with that name, or null if there is none.
 */
app.get('/getRoute', (req, res) => {
  const route = network.routes.find((r) => r.name === req.query.routeName);
  res.json(route ?? null);
});

/**
 * POST /routeToString (Test 2): the request body is a route object.
 * Responds with that route as text.
 */
app.post('/routeToString', (req, res) => res.send(routeToString(req.body)));

/**
 * POST /routeDistance (Test 3): the request body is a route object.
 * Responds with the route's length in miles.
 */
app.post('/routeDistance', (req, res) => res.json(routeDistance(req.body)));

/**
 * GET /findRoute?startStop=Betaford&endStop=Epsilon (bonus Test 4)
 * Responds with the trip description from findRoute().
 */
app.get('/findRoute', (req, res) => {
  res.send(findRoute(req.query.startStop, req.query.endStop));
});

app.listen(PORT, () => {
  console.log(`railway_route.js listening on port ${PORT}`);
});
