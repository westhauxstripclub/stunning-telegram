/**
 * @fileoverview Network server: answers questions about a whole railway
 * network. It listens on port 3000.
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

/** GET /getNetworkName: sends the network's name (Test 1). */
app.get('/getNetworkName', (req, res) => res.send(getNetworkName()));

/** GET /getRoutes: sends the array of routes (Test 2). */
app.get('/getRoutes', (req, res) => res.json(getRoutes()));

/** GET /getRouteNames: sends the array of route names (Test 3). */
app.get('/getRouteNames', (req, res) => res.json(getRouteNames()));

/** GET /routeNamesToString: sends the route names as text (Test 4). */
app.get('/routeNamesToString', (req, res) => res.send(routeNamesToString()));

/** GET /totalStations: sends the number of stations (Test 5). */
app.get('/totalStations', (req, res) => res.json(totalStations(network)));

/** GET /findLongestRoute: sends the longest route (Test 6). */
app.get('/findLongestRoute', (req, res) => res.json(findLongestRoute()));

/** GET /routeToString?routeName=X: sends route X as text (Test 6). */
app.get('/routeToString', (req, res) => {
  res.send(routeToString(getRoute(req.query.routeName)));
});

app.listen(3000);

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
 * Returns the network's name.
 * @return {string} The name.
 */
function getNetworkName() {
  return network.networkName;
}

/**
 * Returns the network's routes.
 * @return {!Array<!Object>} The routes.
 */
function getRoutes() {
  return network.routes;
}

/**
 * Returns the route names.
 * @return {!Array<string>} The route names.
 */
function getRouteNames() {
  return network.routes.map((route) => route.name);
}

/**
 * Returns the route names, one per line, with a comma after all but the last.
 * @return {string} The route names.
 */
function routeNamesToString() {
  return getRouteNames().join(',\n');
}

/**
 * Counts the stations. A Set keeps each stationID once, so a station on more
 * than one route is counted once.
 * @param {!Object} data The network.
 * @return {number} The number of stations.
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
 * Finds the longest route (the first one if there is a tie).
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
 * Finds a route by name.
 * @param {string} routeName The route's name.
 * @return {!Object|undefined} The route, or undefined if there is none.
 */
function getRoute(routeName) {
  return network.routes.find((route) => route.name === routeName);
}

/**
 * Returns a route as text: its name and color, each stop and its miles from
 * the start, and the route's distance.
 * @param {!Object} route The route.
 * @return {string} The route as text.
 */
function routeToString(route) {
  const miles = cumulativeMiles(route);
  let text = `ROUTE:${route.name}(${route.color})\nSTATIONS:\n`;
  for (let i = 0; i < route.stops.length; i++) {
    const stop = route.stops[i];
    text += `${stop.stop} ${stop.stationName} ${miles[i]} miles\n`;
  }
  return text + `Total Route Distance: ${routeDistance(route)} miles`;
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

/**
 * Returns how many miles each stop is from the start of the route.
 * @param {!Object} route The route.
 * @return {!Array<number>} The miles to each stop.
 */
function cumulativeMiles(route) {
  const miles = [0];
  for (let i = 0; i < route.stops.length - 1; i++) {
    miles.push(miles[i] + route.stops[i].distanceToNext);
  }
  return miles;
}
