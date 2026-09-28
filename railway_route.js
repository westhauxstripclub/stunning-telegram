/**
 * @fileoverview Route server: answers questions about one route, and (bonus)
 * finds a single route that has two given stops. It listens on port 3002.
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

/** GET /getRoute?routeName=X: sends route X (Test 1). */
app.get('/getRoute', (req, res) => res.json(getRoute(req.query.routeName)));

/** GET /routeToString?routeName=X: sends route X as text (Test 2). */
app.get('/routeToString', (req, res) => {
  res.send(routeToString(getRoute(req.query.routeName)));
});

/** GET /routeDistance?routeName=X: sends route X's distance (Test 3). */
app.get('/routeDistance', (req, res) => {
  res.json(routeDistance(getRoute(req.query.routeName)));
});

/** GET /findRoute?startStop=A&endStop=B: sends the trip (bonus Test 4). */
app.get('/findRoute', (req, res) => {
  res.send(findRoute(req.query.startStop, req.query.endStop));
});

app.listen(3002);

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

/**
 * Finds a route that has both stops and describes the trip. Routes are checked
 * from last to first, so the last matching route is used (as in the smokey
 * sample output).
 * @param {string} startStop The first stop's name.
 * @param {string} endStop The second stop's name.
 * @return {string} The trip, or a message that no route has both stops.
 */
function findRoute(startStop, endStop) {
  for (let i = network.routes.length - 1; i >= 0; i--) {
    const route = network.routes[i];
    const names = route.stops.map((stop) => stop.stationName);
    const start = names.indexOf(startStop);
    const end = names.indexOf(endStop);
    if (start !== -1 && end !== -1) {
      const miles = cumulativeMiles(route);
      const stops = Math.abs(end - start);
      const distance = Math.abs(miles[end] - miles[start]);
      return `${route.name} ${startStop} to ${endStop} ` +
          `${stops} ${stops === 1 ? 'stop' : 'stops'} and ${distance} miles`;
    }
  }
  return `No direct route found from ${startStop} to ${endStop}`;
}
