/**
 * @fileoverview Server for the "routeSummary" part of the Railway API. It
 * responds with a summary of a railway network, one line per route, with the
 * routes in file order or sorted by name or by length (ascending or
 * descending). Listens on port 3001 inside the pod.
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const express = require('express');
const {readNetwork, routeDistance} = require('./shared.js');

const PORT = 3001;
const app = express();

/** @type {?Object} The network loaded by /readNetwork. */
let network = null;

/**
 * Builds the route summary: one line per route with its name, first station,
 * last station, and length, padded so the columns roughly line up.
 * @param {!Array<!Object>} routes The routes, in the order to list them.
 * @return {string} The summary text.
 */
function routeSummary(routes) {
  const lines = routes.map((route) => {
    const first = route.stops[0].stationName;
    const last = route.stops[route.stops.length - 1].stationName;
    return `${route.name.padEnd(20)} - ${first.padEnd(15)} to ` +
        `${last.padEnd(15)} - ${routeDistance(route)} miles`;
  });
  return ['Routes Summary', '==============', ...lines].join('\n');
}

/**
 * Sorts routes by name. Returns a sorted copy, so the network's own route
 * order never changes. Descending is the ascending list reversed.
 * @param {!Array<!Object>} routes The routes to sort.
 * @param {boolean} ascending True for A to Z, false for Z to A.
 * @return {!Array<!Object>} The sorted copy.
 */
function sortRoutesByName(routes, ascending) {
  const sorted = [...routes].sort((a, b) => a.name.localeCompare(b.name));
  return ascending ? sorted : sorted.reverse();
}

/**
 * Sorts routes by length. Returns a sorted copy, so the network's own route
 * order never changes. Routes of equal length keep their file order, and
 * descending is the ascending list reversed.
 * @param {!Array<!Object>} routes The routes to sort.
 * @param {boolean} ascending True for shortest first, false for longest first.
 * @return {!Array<!Object>} The sorted copy.
 */
function sortRoutesByLength(routes, ascending) {
  const byLength = (a, b) => routeDistance(a) - routeDistance(b);
  const sorted = [...routes].sort(byLength);
  return ascending ? sorted : sorted.reverse();
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
 * GET /routeSummary?sortBy=name&ascending=true (Tests 1 to 5)
 * Responds with the route summary. sortBy is 'name' or 'length' (leave it out
 * to keep file order); ascending=false sorts in descending order.
 */
app.get('/routeSummary', (req, res) => {
  const ascending = req.query.ascending !== 'false';
  let routes = network.routes;
  if (req.query.sortBy === 'name') {
    routes = sortRoutesByName(routes, ascending);
  } else if (req.query.sortBy === 'length') {
    routes = sortRoutesByLength(routes, ascending);
  }
  res.send(routeSummary(routes));
});

app.listen(PORT, () => {
  console.log(`railway_routeSummary.js listening on port ${PORT}`);
});
