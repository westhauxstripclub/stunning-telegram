# CS 253 Project 1: Railway Network

Authors: TODO add team member names (Group 3)
Date: 2026-09-28

## Description

Three servers answer questions about a railway network stored in a `.json` file, and three
clients print the answers:

- `client_network.js`: the network name, the routes, the route names, the number of
  stations, and the longest route.
- `client_routeSummary.js`: one line per route, unsorted and then sorted by name and by
  length (ascending and descending).
- `client_route.js`: one route and its distance, and (bonus) a single route that has two
  given stops.

If the file is not valid JSON (like `in_error.json`), the client prints only
`Not able to parse the input file.`

## Packages

Node.js, npm, Podman, and the npm packages `express` and `axios` (installed by
`npm install`).

## How to run

The servers run in a Podman pod. The clients call host ports 30600 (network), 30601
(route summary), and 30602 (route).

```bash
npm install
./create_and_run_containers.sh
node client_network.js uk.json
node client_routeSummary.js uk.json
node client_route.js uk.json "Great Western Railway Line" Cardiff Reading
./delete_containers.sh
```

## Known errors

Our output matches the sample output files except where they disagree with the data:

- `simpleton_output.pdf` has no `NETWORK Tests` line and no `===` after the test 2 title;
  the other samples have both, and so does our output.
- `smokey_output.pdf` numbers Bryson City 1 on the Dillsboro to Nantahala route, but
  `smokey.json` numbers it 2.
- The bonus line in `uk_output.pdf` says `Great Western Railway`, but the route in
  `uk.json` is `Great Western Railway Line`.
- Three route summary lines in `uk_output.pdf` have extra spaces that we do not copy.
