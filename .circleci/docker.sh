#!/bin/bash
set -u

# collect params from ENV vars
DATE=`date +%Y-%m-%d`
DOCKER_REPOSITORY="pelias"
DOCKER_PROJECT="${DOCKER_REPOSITORY}/${CIRCLE_PROJECT_REPONAME}"

# the name of the image that represents the "branch", that is an image that will be updated over time with the git branch
# the production branch is changed to "latest", otherwise the git branch becomes the name of the version
if [[ "${CIRCLE_BRANCH}" == "production" ]]; then
	DOCKER_BRANCH_IMAGE_VERSION="latest"
else
	DOCKER_BRANCH_IMAGE_VERSION="${CIRCLE_BRANCH}"
fi
DOCKER_BRANCH_IMAGE_NAME="${DOCKER_PROJECT}:${DOCKER_BRANCH_IMAGE_VERSION}"

# the name of the image that represents the "tag", that is an image that is named with the date and git commit and will never be changed
DOCKER_TAG_IMAGE_VERSION="${CIRCLE_BRANCH}-${DATE}-${CIRCLE_SHA1}"
DOCKER_TAG_IMAGE_NAME="${DOCKER_PROJECT}:${DOCKER_TAG_IMAGE_VERSION}"

# build image and login to docker hub
docker build -t $DOCKER_PROJECT .
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"

# copy the image to each of the two tags, and push
docker tag $DOCKER_PROJECT $DOCKER_BRANCH_IMAGE_NAME
docker tag $DOCKER_PROJECT $DOCKER_TAG_IMAGE_NAME
docker push $DOCKER_BRANCH_IMAGE_NAME
docker push $DOCKER_TAG_IMAGE_NAME
