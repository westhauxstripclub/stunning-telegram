# CS 253 Project 1: Railway Network

**Authors:** TODO add team member names (Group 3)
**Date:** 2026-09-28

## What it does

A railway network is stored in a `.json` file: the network has routes, and each route has
stops. Three servers answer questions about a network, and three clients print the answers:

- `client_network.js` prints the network name, the routes and route names, how many
  stations there are, and the longest route.
- `client_routeSummary.js` prints one line per route (name, first and last stop, distance):
  unsorted, sorted by name (A to Z, Z to A), and sorted by distance (short to long, long to
  short).
- `client_route.js` prints one route with each stop's distance from the start, and the
  route's distance. Bonus: it finds a single route that has two given stops and prints the
  stops and miles between them.

If the file cannot be read or is not valid JSON (like `in_error.json`), the client prints
only `Not able to parse the input file.`

## What to install

- Node.js and npm
- Podman
- The npm packages `express` and `axios` (`npm install` reads them from `package.json`)

## How to run

Each server runs in its own container in a Podman pod named `railway`. The clients run on
your machine and call these host ports:

| Server | Port inside the pod | Host port |
| --- | --- | --- |
| `railway_network.js` | 3000 | 30600 |
| `railway_routeSummary.js` | 3001 | 30601 |
| `railway_route.js` | 3002 | 30602 |

```bash
npm install
./create_and_run_containers.sh
node client_network.js uk.json
node client_routeSummary.js uk.json
node client_route.js uk.json "Great Western Railway Line" Cardiff Reading
./delete_containers.sh
```

The data files are `simpleton.json`, `notional.json`, `uk.json`, `smokey.json`, and
`in_error.json`. `client_route.js` needs a data file, a route name, and two stops. Put names
that have spaces in quotes.

## Known errors

Our output matches the sample output files, except where the samples do not match the data
files or each other:

- `simpleton_output.pdf` has no `NETWORK Tests` line and no `===` at the end of the test 2
  title. The other samples have both, so we print them.
- `smokey_output.pdf` shows `1 Bryson City 20 miles`, but `smokey.json` gives that stop the
  number 2, so we print 2.
- The bonus line in `uk_output.pdf` says `Great Western Railway`, but the route's name in
  `uk.json` is `Great Western Railway Line`, so we print the full name.
- Three route summary lines in `uk_output.pdf` have extra spaces that we do not copy.
