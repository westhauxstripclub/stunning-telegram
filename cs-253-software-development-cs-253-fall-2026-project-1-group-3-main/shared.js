/**
 * @fileoverview Functions used by more than one railway server: reading a
 * network .json file, measuring a route, and turning a route into text.
 *
 * Authors: TODO add team member names (Group 3)
 * Last modified: 2026-09-28
 */
const fs = require('fs');

/**
 * Reads and parses a railway network .json file.
 * @param {string} fileName Name and path of the .json file.
 * @return {?Object} The network, or null if the file cannot be read or is
 *     not valid JSON.
 */
function readNetwork(fileName) {
  try {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Returns the length of a route: the sum of each stop's distanceToNext
 * (the last stop's distanceToNext is null, so it counts as 0).
 * @param {!Object} route A route object.
 * @return {number} The route length in miles.
 */
function routeDistance(route) {
  return route.stops.reduce((sum, stop) => sum + (stop.distanceToNext ?? 0), 0);
}

/**
 * Turns a route into text: its name and color, then each stop with its
 * distance from the start of the route, then the total distance.
 * @param {!Object} route A route object.
 * @return {string} The route as text.
 */
function routeToString(route) {
  let text = `ROUTE:${route.name}(${route.color})\nSTATIONS:\n`;
  let miles = 0;
  for (const stop of route.stops) {
    text += `${stop.stop} ${stop.stationName} ${miles} miles\n`;
    miles += stop.distanceToNext ?? 0;
  }
  return `${text}Total Route Distance: ${miles} miles`;
}

module.exports = {readNetwork, routeDistance, routeToString};
