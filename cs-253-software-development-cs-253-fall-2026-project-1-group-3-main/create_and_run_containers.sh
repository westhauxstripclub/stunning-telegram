#!/bin/bash
# create_and_run_containers.sh
# Builds an image for each railway service, creates the "railway" pod with its
# host-to-container port mappings, and runs one container per service into it.
#
# Based on a version by Lex Lapish.
#
# NOTE: on macOS you must start the Podman virtual machine first. Uncomment
# the next line. On WSL2 and on native Linux, leave it commented out.
# podman machine start

set -e   # stop immediately if any command below fails

# ---------------------------------------------------------------------------
# 1. Build the images.
#
#    -f   path to the Containerfile
#    --tag  name to give the built image
#    .    the build context: the directory COPY reads from
# ---------------------------------------------------------------------------
podman build -f Containerfile.network      --tag railway_network      .
podman build -f Containerfile.routeSummary --tag railway_routesummary .
podman build -f Containerfile.route        --tag railway_route        .

# ---------------------------------------------------------------------------
# 2. Create the pod and publish its ports.
#
#    Each -p is  host:container
#      left  = the port on your machine, which your CLIENT programs call
#      right = the port inside the pod, which the SERVER code listens on
#
#    Containers in this pod reach each other at localhost on the RIGHT-hand
#    numbers. Ports must be published here, not on podman run.
# ---------------------------------------------------------------------------
podman pod create --name railway \
    -p 30600:3000 \
    -p 30601:3001 \
    -p 30602:3002

# ---------------------------------------------------------------------------
# 3. Run one container per service into the pod.
#
#    -d            detached, so the prompt returns
#    --pod railway put this container in the pod named "railway"
#    --name X      name for this container, used by podman logs/stop/start
#    last argument the IMAGE to run
#
#    The pod name and the image name are SEPARATE arguments.
# ---------------------------------------------------------------------------
podman run -d --pod railway --name network      railway_network
podman run -d --pod railway --name routesummary railway_routesummary
podman run -d --pod railway --name route        railway_route

# ---------------------------------------------------------------------------
# PROJECT 2: you add the bestJourneys and disruptions services yourself.
#
# Three edits are needed, one in each numbered section above:
#   - a podman build line for each new service
#   - two more -p mappings on podman pod create (30603:3003, 30604:3004)
#   - a podman run line for each new service
#
# Remember that no two containers in a pod may listen on the same port.
# ---------------------------------------------------------------------------

echo
echo "Pod 'railway' is up. Containers:"
podman ps --pod
echo
echo "Clients on this machine should call host ports 30600, 30601, 30602."
