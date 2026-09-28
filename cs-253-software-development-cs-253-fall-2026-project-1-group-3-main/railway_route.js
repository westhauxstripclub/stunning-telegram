const express = require("express");
const fs = require("fs");


const app = express();

let network = null;
// ======== app calls ==========
app.get("/readNetwork", (req, res) => {
    const fileName = req.query.file;

    if (!fileName) {
        return res.status(400).send("Bad filename");
    }
    let parsed = readNetwork(fileName);
    let loaded = setNetwork(parsed);
    if (!loaded) {
        return res.status(400).send("Not able to parse the input file.");
    }

    res.send("file loaded");
});

app.get("/getRoute", (req, res) => {
    if (network == null) {
        return res.status(400).send("Network not loaded");
    }

    const routeName = req.query.routeName;
    if (!routeName) {
        return res.status(400).send("Missing routeName");
    }

    const route = getRoute(routeName);
    if (route == null) {
        return res.status(404).send("Route not found");
    }

    res.json(route);
});
app.get("/routeToString", (req, res) => {
    if (network == null) {
        return res.status(400).send("Network not loaded");
    }

    const routeName = req.query.routeName;
    if (!routeName) {
        return res.status(400).send("Missing routeName");
    }

    const route = getRoute(routeName);
    res.send(routeToString(route) );
});
app.get("/routeDistance", (req, res) => {
    if (network == null) {
        return res.status(400).send("Network not loaded");
    }

    const routeName = req.query.routeName;
    if (!routeName) {
        return res.status(400).send("Missing routeName");
    }

    const route = getRoute(routeName);
    res.send(String(routeDistance(route )) );
});
app.get("/getDistanceBetweenStops", (req, res) => {
    if (network == null) {
        return res.status(400).send("Network not loaded");
    }

    const routeName = req.query.routeName;
    const startStop = req.query.startStop;
    const endStop = req.query.endStop;

    if (!routeName || !startStop || !endStop) {
        return res.status(400).send("Missing routeName/startStop/endStop");
    }

    const route = getRoute(routeName);
    const result = getDistanceBetweenStops(route, startStop, endStop);

    if (result == null) {
        return res.status(404).send("Stop not found");
    }

    res.send(result);
});
app.get("/findRoute", (req, res) => {
    if (network == null) {
        return res.status(400).send("Network not loaded");
    }

    const startStop = req.query.startStop;
    const endStop = req.query.endStop;

    if (!startStop || !endStop) {
        return res.status(400).send("Missing startStop or endStop");
    }

    res.send(findRoute(startStop, endStop));
});



// ====== endpoints ======
function readNetwork(fileName) {
    try {
        let text = fs.readFileSync(fileName, "utf-8");

        network = JSON.parse(text);
        return network;
    }
    catch (err) {
        console.log("file could not be read");
        return null; //  if the file cant be read return null
    }
}
function getRoute(routeName) {

    // compares names using stringHelper so case/spaces dont matter
    for (let i = 0; i < network.routes.length; i++) {

        let route = network.routes[i];

        if (stringHelper(route.name) == stringHelper(routeName)) {
            return route;
        }
    }

    return null;
}
function routeToString(route) {

    if (route == null) {
        return "Route not found";
    }

    let miles = cumulativeMiles(route);
    let total = routeDistance(route);

    let output = "";

    output = output + "===TEST=2=ROUTE=TO=STRING===\n";
    output = output + "ROUTE:" + route.name + "(" + route.color + ")\n";
    output = output + "STATIONS:\n";

    for (let i = 0; i < route.stops.length; i++) {

        let stop = route.stops[i];

        output = output +
            (i + 1) + " " +
            stop.stationName + " " +
            miles[i] + " miles\n";
    }

    output = output + "Total Route Distance: " + total + " miles";

    return output;
}
function routeDistance(route) {

    if (route == null) {
        return 0;
    }

    if (!Array.isArray(route.stops)) {
        return 0;
    }

    let total = 0;

    for (let i = 0; i < route.stops.length; i++) {

        let stopObject = route.stops[i];

        if (stopObject != null) {

            let distance = stopObject.distanceToNext;

            if (distance != null) {
                total += Number(distance);
            }
        }
    }

    return total;
}

//============== Bous endpoints =====================

function getDistanceBetweenStops(route, startStop, endStop) {

    let startIndex = findStopIndexByName(route, startStop);
    let endIndex = findStopIndexByName(route, endStop);

    if (startIndex == -1 || endIndex == -1) {
        return null;
    }

    let miles = cumulativeMiles(route);

    let distance =
        Math.abs(miles[endIndex] - miles[startIndex]);

    let stopsCount =
        Math.abs(endIndex - startIndex) + 1;

  
    return route.name + ": " +
        startStop + " to " +
        endStop + " " +
        stopsCount + " stops and " +
        distance + " miles";
}
function findRoute(startStop, endStop) {

    for (let i = 0; i < network.routes.length; i++) {

        let route = network.routes[i];

        let startIndex = findStopIndexByName(route, startStop);
        let endIndex = findStopIndexByName(route, endStop);

        if (startIndex != -1 && endIndex != -1) {
            return getDistanceBetweenStops(route, startStop, endStop);
        }
    }

    return "No direct route found between " +
           startStop + " to " +
           endStop + ".";
}

function stringHelper(str) {
    if (str == null) {
        return "";
    }

    str = String(str);     // convert to string
    str = str.trim();      // remove spaces from beginning and end
    str = str.toLowerCase();  // make lowercase

    return str;
}
function cumulativeMiles (route) {
	let milesArray = [];

    if (route == null) {
        return milesArray;
    }
    if (!Array.isArray(route.stops )) {
        return milesArray;
    }

    let total = 0;
    for (let i = 0; i < route.stops.length; i++) {
        milesArray.push(total );
        let stopObject = route.stops[i ];

        if (stopObject != null) {
            let distance = stopObject.distanceToNext ;
            if (distance != null) {
                total = total + Number( distance );
            }
        }
    }

    return milesArray;
}
