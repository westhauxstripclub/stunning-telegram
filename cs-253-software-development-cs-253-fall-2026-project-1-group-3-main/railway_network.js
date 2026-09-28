/**
 * @fileoverview railway_network.js: the "network" server of the Railway API.
 * It loads a railway network .json file and answers questions about the whole
 * network: its name, its routes, how many stations it has, and its longest
 * route. It listens on port 3000 inside the pod.
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

/** GET /getNetworkName (Test 1): sends the network's name. */
app.get('/getNetworkName', (req, res) => {
  res.send(getNetworkName());
});

/** GET /getRoutes (Test 2): sends the array of routes. */
app.get('/getRoutes', (req, res) => {
  res.json(getRoutes());
});

/** GET /getRouteNames (Test 3): sends the array of route names. */
app.get('/getRouteNames', (req, res) => {
  res.json(getRouteNames());
});

/** GET /routeNamesToString (Test 4): sends the route names as text. */
app.get('/routeNamesToString', (req, res) => {
  res.send(routeNamesToString());
});

/** GET /totalStations (Test 5): sends the number of stations. */
app.get('/totalStations', (req, res) => {
  res.json(totalStations(network));
});

/** GET /findLongestRoute (Test 6): sends the longest route. */
app.get('/findLongestRoute', (req, res) => {
  res.json(findLongestRoute());
});

/** GET /routeToString?routeName=X (Test 6): sends route X as text. */
app.get('/routeToString', (req, res) => {
  res.send(routeToString(getRoute(req.query.routeName)));
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
 * Returns the name of the network.
 * @return {string} The network name.
 */
function getNetworkName() {
  return network.networkName;
}

/**
 * Returns the routes of the network.
 * @return {!Array<!Object>} The array of routes.
 */
function getRoutes() {
  return network.routes;
}

/**
 * Returns the names of the routes.
 * @return {!Array<string>} The route names.
 */
function getRouteNames() {
  const names = [];
  for (let i = 0; i < network.routes.length; i++) {
    names.push(network.routes[i].name);
  }
  return names;
}

/**
 * Returns the route names, one per line, with a comma after all but the last.
 * @return {string} The route names.
 */
function routeNamesToString() {
  const names = getRouteNames();
  let output = '';
  for (let i = 0; i < names.length; i++) {
    output = output + names[i];
    if (i < names.length - 1) {
      output = output + ',\n';
    }
  }
  return output;
}

/**
 * Counts the stations on all routes. A station on more than one route has the
 * same stationID each time, so the Set counts it only once.
 * @param {!Object} data The railway network.
 * @return {number} The number of stations.
 */
function totalStations(data) {
  const seen = new Set();
  for (let i = 0; i < data.routes.length; i++) {
    const stops = data.routes[i].stops;
    for (let j = 0; j < stops.length; j++) {
      seen.add(stops[j].stationID);
    }
  }
  return seen.size;
}

/**
 * Finds the route with the longest distance, without changing the route order.
 * @return {!Object} The longest route (the first one if there is a tie).
 */
function findLongestRoute() {
  const routes = network.routes;
  let longest = routes[0];
  let maxDistance = routeDistance(longest);
  for (let i = 1; i < routes.length; i++) {
    const dist = routeDistance(routes[i]);
    if (dist > maxDistance) {
      maxDistance = dist;
      longest = routes[i];
    }
  }
  return longest;
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

app.listen(3000, () => {
  console.log('railway_network.js is listening on port 3000');
});
