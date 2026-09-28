/**
 * @fileoverview railway_routeSummary.js: the "routeSummary" server of the
 * Railway API. It sends a summary of the routes (one line per route), and it
 * can first sort the routes by name or by length. It listens on port 3001
 * inside the pod.
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const express = require('express');
const fs = require('fs');

const app = express();

let network = null;

// ========== REST endpoints ==========

/** GET /readNetwork?file=X: loads file X; sends the network or null. */
app.get('/readNetwork', (req, res) => {
  res.json(readNetwork(req.query.file));
});

/** GET /routeSummary (Tests 1-5): sends the summary in the current order. */
app.get('/routeSummary', (req, res) => {
  res.send(routeSummary());
});

/** GET /sortRoutesByName?ascending=true: sorts the routes by name. */
app.get('/sortRoutesByName', (req, res) => {
  sortRoutesByName(network, req.query.ascending === 'true');
  res.send('sorted');
});

/** GET /sortRoutesByLength?ascending=true: sorts the routes by length. */
app.get('/sortRoutesByLength', (req, res) => {
  sortRoutesByLength(network, req.query.ascending === 'true');
  res.send('sorted');
});

// ========== Functions ==========

/**
 * Reads a railway network .json file and saves it in the network variable.
 * @param {string} fileName The name of the .json file.
 * @return {?Object} The network, or null if the file cannot be read or parsed.
 */
function readNetwork(fileName) {
  try {
    const text = fs.readFileSync(fileName, 'utf-8');
    network = JSON.parse(text);
    return network;
  } catch (err) {
    return null;
  }
}

/**
 * Returns the route summary: a title, then one line per route with its name,
 * first stop, last stop, and distance. padEnd adds spaces so columns line up.
 * @return {string} The route summary.
 */
function routeSummary() {
  let output = 'Routes Summary\n==============';
  for (let i = 0; i < network.routes.length; i++) {
    const route = network.routes[i];
    const start = route.stops[0].stationName;
    const end = route.stops[route.stops.length - 1].stationName;
    output = output + '\n' + route.name.padEnd(20) + ' - ' +
        start.padEnd(15) + ' to ' + end.padEnd(15) + ' - ' +
        routeDistance(route) + ' miles';
  }
  return output;
}

/**
 * Sorts the routes of a network by name.
 * @param {!Object} data The railway network.
 * @param {boolean} ascending True for A to Z, false for Z to A.
 */
function sortRoutesByName(data, ascending) {
  data.routes.sort((a, b) => {
    if (a.name < b.name) {
      return ascending ? -1 : 1;
    }
    if (a.name > b.name) {
      return ascending ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Sorts the routes of a network by distance. Routes with the same distance
 * are sorted by name, so the result does not depend on the order before.
 * @param {!Object} data The railway network.
 * @param {boolean} ascending True for shortest first, false for longest first.
 */
function sortRoutesByLength(data, ascending) {
  data.routes.sort((a, b) => {
    let difference = routeDistance(a) - routeDistance(b);
    if (difference === 0) {
      difference = a.name < b.name ? -1 : 1;
    }
    return ascending ? difference : -difference;
  });
}

/**
 * Returns the distance of a route: the sum of the distances between its stops.
 * @param {!Object} route The route.
 * @return {number} The distance in miles.
 */
function routeDistance(route) {
  let total = 0;
  for (let i = 0; i < route.stops.length; i++) {
    const distance = route.stops[i].distanceToNext;
    if (distance != null) { // the last stop has no next stop
      total = total + distance;
    }
  }
  return total;
}

app.listen(3001, () => {
  console.log('railway_routeSummary.js is listening on port 3001');
});
