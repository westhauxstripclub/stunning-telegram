# CS 253 Project 1: Railway Network

**Authors:** TODO add team member names (Group 3)
**Date:** 2026-09-28

## What it does

A railway network is stored in a `.json` file: the network has routes, and each route has
stops. Three small web servers answer questions about a network, and three command-line
clients ask those questions and print the answers. Each server runs in its own container,
and the three containers run in one Podman pod named `railway`.

- `client_network.js` prints the network name, its routes and route names, how many
  stations it has, and its longest route.
- `client_routeSummary.js` prints one line per route (name, first and last station,
  length): in file order, by name A→Z and Z→A, and by length shortest→longest and
  longest→shortest.
- `client_route.js` prints one route, found by name, with each stop's distance from the
  start and the route's length. Bonus: it finds a single route that connects two stations
  and prints the stops and miles between them.

If the data file is missing or is not valid JSON (for example `in_error.json`), the client
prints only `Not able to parse the input file.`

## What to install

- Node.js and npm
- Podman 3.4 or later
- The npm packages `express` and `axios` (listed in `package.json`; `npm install` gets them)

## How to run

The clients run on your machine and call the servers through these host ports:

| Server | Port inside the pod | Host port the client calls |
| --- | --- | --- |
| `railway_network.js` | 3000 | 30600 |
| `railway_routeSummary.js` | 3001 | 30601 |
| `railway_route.js` | 3002 | 30602 |

From this directory:

```bash
npm install                      # installs axios for the clients (only needed once)
./create_and_run_containers.sh   # builds the 3 images and starts the railway pod
node client_network.js uk.json
node client_routeSummary.js uk.json
node client_route.js uk.json "Great Western Railway Line" Cardiff Reading
./delete_containers.sh           # stops and removes the pod and the images
```

`client_route.js` takes the data file, a route name, and the two stations for the bonus
test. Put names that contain spaces in quotes. The other data files work the same way:

```bash
node client_route.js simpleton.json Simpleton Betaford Epsilon
node client_route.js notional.json "Cambleton Line" Elton Bury
node client_route.js smokey.json "Bryson City to Dillsboro" "Bryson City" Nantahala
node client_network.js in_error.json
```

If a script gives `Permission denied`, run `chmod +x *.sh` once.

## Files

- `railway_network.js`, `railway_routeSummary.js`, `railway_route.js`: the three servers.
- `shared.js`: functions more than one server uses (`readNetwork`, `routeDistance`,
  `routeToString`).
- `client_network.js`, `client_routeSummary.js`, `client_route.js`: the three clients.
- `Containerfile.*`, `.containerignore`, `create_and_run_containers.sh`,
  `delete_containers.sh`: the container setup from `podman_files.zip`.
- `simpleton.json`, `notional.json`, `uk.json`, `smokey.json`, `in_error.json`: the data sets.
- `examples/`: the provided route maps and sample output. `podman_files/`: the Podman readme
  and the Project 2 Containerfiles.

## Known issues

Our output matches the sample output files except where the samples disagree with the data
files or with each other:

- `simpleton_output.pdf` has no `NETWORK Tests` line and ends the test 2 heading without
  `===`. The other three samples have both, so our output does too.
- `smokey_output.pdf` shows `1 Bryson City 20 miles` on the Dillsboro to Nantahala route,
  but `smokey.json` numbers that stop 2, which is what we print.
- The bonus line in `uk_output.pdf` says `Great Western Railway`, but the route is named
  `Great Western Railway Line` in `uk.json` and in tests 1 and 2 of the same sample, so we
  print the full name.
- The route summary pads each column to a fixed width. This lines up the same way as the
  samples except for three lines in `uk_output.pdf` that are padded unevenly in the sample
  itself.

Notes on the data:

- If more than one route connects the two bonus stations, we report the last one in the
  file, which is what `smokey_output.pdf` shows.
- In `uk.json` the Midland Main Line has two stops numbered 3, and some of its
  `distanceToPrev` values disagree with `distanceToNext`. We print stop numbers as they
  are in the file and measure distances with `distanceToNext`, which gives the sample's
  240 miles.
