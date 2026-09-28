/**
 * @fileoverview railway_route.js: the "route" server of the Railway API. It
 * answers questions about one route, found by its name, and (bonus) finds a
 * single route that has two given stops. It listens on port 3002 inside the
 * pod.
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

/** GET /getRoute?routeName=X (Test 1): sends route X, or null. */
app.get('/getRoute', (req, res) => {
  res.json(getRoute(req.query.routeName));
});

/** GET /routeToString?routeName=X (Test 2): sends route X as text. */
app.get('/routeToString', (req, res) => {
  res.send(routeToString(getRoute(req.query.routeName)));
});

/** GET /routeDistance?routeName=X (Test 3): sends the distance of route X. */
app.get('/routeDistance', (req, res) => {
  res.json(routeDistance(getRoute(req.query.routeName)));
});

/** GET /findRoute?startStop=A&endStop=B (Test 4, bonus): sends the trip. */
app.get('/findRoute', (req, res) => {
  res.send(findRoute(req.query.startStop, req.query.endStop));
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
 * Finds a route by its name.
 * @param {string} routeName The name of the route.
 * @return {?Object} The route, or null if there is no route with that name.
 */
function getRoute(routeName) {
  for (let i = 0; i < network.routes.length; i++) {
    if (network.routes[i].name === routeName) {
      return network.routes[i];
    }
  }
  return null;
}

/**
 * Returns a route as text: its name and color, each stop with its miles from
 * the start, and the total distance.
 * @param {!Object} route The route.
 * @return {string} The route as text.
 */
function routeToString(route) {
  const miles = cumulativeMiles(route);
  let output = 'ROUTE:' + route.name + '(' + route.color + ')\n';
  output = output + 'STATIONS:\n';
  for (let i = 0; i < route.stops.length; i++) {
    const stop = route.stops[i];
    output = output + stop.stop + ' ' + stop.stationName + ' ' +
        miles[i] + ' miles\n';
  }
  output = output + 'Total Route Distance: ' + routeDistance(route) + ' miles';
  return output;
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

/**
 * Returns how many miles each stop is from the start of the route.
 * @param {!Object} route The route.
 * @return {!Array<number>} The miles from the start to each stop.
 */
function cumulativeMiles(route) {
  const milesArray = [];
  let total = 0;
  for (let i = 0; i < route.stops.length; i++) {
    milesArray.push(total);
    const distance = route.stops[i].distanceToNext;
    if (distance != null) {
      total = total + distance;
    }
  }
  return milesArray;
}

/**
 * Finds where a stop is on a route.
 * @param {!Object} route The route.
 * @param {string} stationName The name of the stop.
 * @return {number} The index of the stop, or -1 if it is not on the route.
 */
function findStopIndexByName(route, stationName) {
  for (let i = 0; i < route.stops.length; i++) {
    if (route.stops[i].stationName === stationName) {
      return i;
    }
  }
  return -1;
}

/**
 * Describes the trip between two stops on the same route.
 * @param {!Object} route A route that has both stops.
 * @param {string} startStop The name of the first stop.
 * @param {string} endStop The name of the second stop.
 * @return {string} For example "Simpleton Betaford to Epsilon 3 stops and 75
 *     miles".
 */
function getDistanceBetweenStops(route, startStop, endStop) {
  const startIndex = findStopIndexByName(route, startStop);
  const endIndex = findStopIndexByName(route, endStop);
  const miles = cumulativeMiles(route);
  const distance = Math.abs(miles[endIndex] - miles[startIndex]);
  const stopsCount = Math.abs(endIndex - startIndex);
  const stopsWord = stopsCount === 1 ? ' stop' : ' stops';
  return route.name + ' ' + startStop + ' to ' + endStop + ' ' +
      stopsCount + stopsWord + ' and ' + distance + ' miles';
}

/**
 * Bonus: finds a route that has both stops. The routes are checked from last
 * to first, so if more than one route has both stops, the last one is used
 * (this matches the smokey.json sample output).
 * @param {string} startStop The name of the first stop.
 * @param {string} endStop The name of the second stop.
 * @return {string} The trip, or a message that no route has both stops.
 */
function findRoute(startStop, endStop) {
  for (let i = network.routes.length - 1; i >= 0; i--) {
    const route = network.routes[i];
    const startIndex = findStopIndexByName(route, startStop);
    const endIndex = findStopIndexByName(route, endStop);
    if (startIndex !== -1 && endIndex !== -1) {
      return getDistanceBetweenStops(route, startStop, endStop);
    }
  }
  return 'No direct route found from ' + startStop + ' to ' + endStop;
}

app.listen(3002, () => {
  console.log('railway_route.js is listening on port 3002');
});
