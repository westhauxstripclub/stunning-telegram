const express = require("express");
const fs = require("fs");


const app = express();

let network = null;
// ========` app calls ==========
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

app.get("/getNetworkName", (req, res) => {
  if (network == null) {
    return res.status(400).send("Network not loaded");
  }
  res.send(String(getNetworkName() ) );
});
app.get("/getRoutes", (req, res) => {
  if (network == null) {
    return res.status(400).send("Network not loaded");
  }

  res.json(getRoutes());
});
app.get("/getRouteNames", (req, res) => {
  if (network == null) {
    return res.status(400).send("Network not loaded");
  }
  res.json(getRouteNames() );
}); 
app.get("/routeNamesToString", (req, res) => {
  if (network == null) {
    return res.status(400).send("Network not loaded");
  } 
  res.send(routeNamesToString() );
});
app.get("/totalStations", (req, res) => {
  if (network == null) {
    return res.status(400).send("Network not loaded");
  }

  res.send(String(totalStations(network) ) );
} );

app.get("/findLongestRoute", (req, res) => {
  if (network == null) {
    return res.status(400).send("Network not loaded");
  }

  const longest = findLongestRoute();
  if (longest == null) {
    return res.status(404).send("No routes found"); //404 NOT FOUND ERROR 
  }
  res.json(longest);
});
app.get("/longestRouteToString", (req, res) => {
  if (network == null) {
    return res.status(400).send("Network not loaded");
  }

  const longest = findLongestRoute();
  if (longest == null) {
    return res.status(404).send("No routes found");
  }

  res.send(routeToString(longest));
});


//====== endpoints ======
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
function getNetworkName() {

    if (network == null) {
        return null;
    }

    return network.networkName;
}
function getRoutes() {

    if (network == null) {
        return null;
    }

    return network.routes;
}
function getRouteNames() {

    if (network == null) {
        return null;
    }

    let routes = network.routes;

    if (!Array.isArray(routes)) {
        return null;
    }

    let names = [];

    for (let i = 0; i < routes.length; i++) {
        names.push(routes[i].name);
    }

    return names;
}
function routeNamesToString() {
    if (getRouteNames() == null) {
        return null;
    }
    let names = getRouteNames();

    let output = "";

    for (let i = 0; i < names.length; i++) {

        output = output + names[i];

        if (i < names.length - 1) {
            output = output + ",\n";
        }
        else{
            output = output + ".";
        }
    }

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
                total = total + Number(distance);
            }
        }
    }

    return total;
}

//inNetwork is for when the object passed is specified and not on the loacal network value
function totalStations(inNetwork) {

    if (inNetwork == null) {
        return 0;
    }

    if (!Array.isArray(inNetwork.routes)) {
        return 0;
    }

    let seen = new Set();

    for (let i = 0; i < inNetwork.routes.length; i++) {

        let route = inNetwork.routes[i];

        if (!Array.isArray(route.stops)) {
            continue;
        }

        for (let j = 0; j < route.stops.length; j++) {

            let stop = route.stops[j];

            if (stop != null) {
                seen.add(stop.stationID);
            }
        }
    }

    return seen.size;
}
function findLongestRoute() {

    if (network == null) {
        return null;
    }

    let routes = network.routes;

    if (!Array.isArray(routes) || routes.length == 0) {
        return null;
    }

    let longest = routes[0];
    let maxDistance = routeDistance(longest);

    for (let i = 1; i < routes.length; i++) {

        let dist = routeDistance(routes[i]);

        if (dist > maxDistance) {
            maxDistance = dist;
            longest = routes[i];
        }
    }

    return longest;
}
function routeToString(route) {

    if (route == null) {
        return "Route not found";
    }

    let miles = cumulativeMiles(route);
    let total = routeDistance(route);

    let output = "";

    output = output + route.name + "(" + route.color + ")\n";
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
