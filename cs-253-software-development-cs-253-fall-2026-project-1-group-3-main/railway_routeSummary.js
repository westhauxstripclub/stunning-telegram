const express = require("express");
const fs = require("fs");


const app = express();

let network = null;
//========== app calls ==========
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

app.get("/routeSummary", (req, res) => {
    if (network == null) {
        return res.status(400).send("Network not loaded");
    }

    res.send(routeSummary() );
});

app.get("/sortRoutesByName", (req, res) => {
    let ascending = req.query.ascending;
    let boolAscending = (ascending == null) ? true : (String(ascending) === "true");
    //if else for comparing the output of req.query.ascending (string) to (bool)
    //then if anything but true, false
    //since JS takes any string as true, two comparisons are needed instead of one
    //this was confusing to work with.

    // this sorts the loaded global network
    sortRoutesByName(network, boolAscending);
    res.send("loaded");
});
app.get("/sortRoutesByLength", (req, res) => {
    let ascending = req.query.ascending;
    let boolAscending = (ascending == null) ? true : (String(ascending) === "true");

    sortRoutesByLength(network, boolAscending);
    res.send("loaded");
});




//========== endpoints ==========
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
function routeSummary() {

    if (network == null) {
        return null;
    }

    let output = "";
    output = output + "Routes Summary\n";
    output = output + "==============\n";

    // loops routes and builds it up
    for (let i = 0; i < network.routes.length; i++) {

        let route = network.routes[i];

        let start = route.stops[0].stationName;
        let end = route.stops[route.stops.length - 1].stationName;
        let dist = routeDistance(route);

        output = output +
            route.name + " - " +
            start + " to " +
            end + " - " +
            dist + " miles\n";
    }

    return output;
}
function sortRoutesByName(newNetwork, ascending) {
    if (network == null) {
        console.log("attempting to sort by name before loading network");
        return; }
    if (typeof newNetwork === "boolean") {
        ascending = newNetwork;
        newNetwork = null;
    }
    if (ascending == null) {
        ascending = true;
    }
    if (newNetwork == null) {
        newNetwork = network;
    }

    //nested sort(a,b for every route)
    newNetwork.routes.sort(function (a, b) {

        let nameA = stringHelper(a.name);
        let nameB = stringHelper(b.name);
        //these swap or dont swap depending on ascending bool
        if (nameA < nameB) {
            return ascending ? -1 : 1;
        }
        if (nameA > nameB) {
            return ascending ? 1 : -1;
        }

        return 0;
    });
}
function addDistances(newNetwork) {
    if (newNetwork == null) {
        newNetwork = network;
    }
    if (network == null) {
            console.log("attempting to add distance before loading network");
            return;
    }
    // sets route.distance on each route (mutates route objects)
    for (let i = 0; i < network.routes.length; i++) {
        network.routes[i].distance = routeDistance(network.routes[i]);
    }
}
function sortRoutesByLength(newNetwork, ascending) {
    if (network == null) {
        console.log("attempting to sort by length before loading network");
        return;
    }
    
    if (typeof newNetwork === "boolean") {
        ascending = newNetwork;
        newNetwork = null;
    }
    if (ascending == null) {
        ascending = true;
    }
    if (newNetwork == null) {
        newNetwork = network;
    }

    addDistances(newNetwork);

    network.routes.sort(function (a, b) {

        if (ascending) {
            return a.distance - b.distance;
        } else {
            return b.distance - a.distance;
        }
    });
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