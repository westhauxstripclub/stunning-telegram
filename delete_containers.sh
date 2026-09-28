#!/bin/bash
# delete_containers.sh
# Stops and removes the railway pod, then deletes the images it was built from.
#
# Based on a version by Lex Lapish.


# Stop the pod. This stops every container inside it.
podman pod stop railway

# Remove the pod. This removes the pod and its containers, but NOT the images,
# which still occupy disk space until removed below.
podman pod rm railway

# Remove the images. Locally built images carry a localhost/ prefix.
podman rmi localhost/railway_network
podman rmi localhost/railway_routesummary
podman rmi localhost/railway_route

# PROJECT 2: add rmi lines for railway_bestjourneys and railway_disruptions.

echo
echo "Pod and images removed. Remaining images:"
podman images
