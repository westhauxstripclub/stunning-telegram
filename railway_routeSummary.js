/**
 * @fileoverview Route summary server: sends a one-line summary of each route,
 * and can sort the routes by name or by length first. It listens on port 3001.
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const express = require('express');
const fs = require('fs');

const app = express();
let network = null;

/** GET /readNetwork?file=X: loads file X; sends the network or null. */
app.get('/readNetwork', (req, res) => res.json(readNetwork(req.query.file)));

/** GET /routeSummary: sends the summary in the current order (Tests 1-5). */
app.get('/routeSummary', (req, res) => res.send(routeSummary()));

/** GET /sortRoutesByName?ascending=true|false: sorts the routes by name. */
app.get('/sortRoutesByName', (req, res) => {
  sortRoutesByName(network, req.query.ascending === 'true');
  res.send('sorted');
});

/** GET /sortRoutesByLength?ascending=true|false: sorts the routes by length. */
app.get('/sortRoutesByLength', (req, res) => {
  sortRoutesByLength(network, req.query.ascending === 'true');
  res.send('sorted');
});

app.listen(3001);

/**
 * Reads a network .json file into the network variable.
 * @param {string} fileName The file to read.
 * @return {?Object} The network, or null if the file cannot be read or parsed.
 */
function readNetwork(fileName) {
  try {
    network = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
    return network;
  } catch (err) {
    return null;
  }
}

/**
 * Returns the summary: one line per route with its name, first stop, last
 * stop, and distance. padEnd adds spaces so the columns line up.
 * @return {string} The summary.
 */
function routeSummary() {
  let text = 'Routes Summary\n==============';
  for (const route of network.routes) {
    const first = route.stops[0].stationName;
    const last = route.stops[route.stops.length - 1].stationName;
    text += `\n${route.name.padEnd(20)} - ${first.padEnd(15)} to ` +
        `${last.padEnd(15)} - ${routeDistance(route)} miles`;
  }
  return text;
}

/**
 * Sorts a network's routes by name.
 * @param {!Object} data The network.
 * @param {boolean} ascending True for A to Z, false for Z to A.
 */
function sortRoutesByName(data, ascending) {
  data.routes.sort((a, b) => a.name.localeCompare(b.name));
  if (!ascending) {
    data.routes.reverse();
  }
}

/**
 * Sorts a network's routes by distance. Routes with the same distance are
 * sorted by name, so the result does not depend on the order before.
 * @param {!Object} data The network.
 * @param {boolean} ascending True for shortest first, false for longest first.
 */
function sortRoutesByLength(data, ascending) {
  data.routes.sort((a, b) => {
    if (routeDistance(a) === routeDistance(b)) {
      return a.name.localeCompare(b.name);
    }
    return routeDistance(a) - routeDistance(b);
  });
  if (!ascending) {
    data.routes.reverse();
  }
}

/**
 * Returns a route's distance: the sum of each stop's distanceToNext (the last
 * stop has none).
 * @param {!Object} route The route.
 * @return {number} The distance in miles.
 */
function routeDistance(route) {
  let total = 0;
  for (let i = 0; i < route.stops.length - 1; i++) {
    total += route.stops[i].distanceToNext;
  }
  return total;
}
