# base image
FROM ubuntu:16.04
ENV DEBIAN_FRONTEND noninteractive

# -- apt --

# dependencies
RUN apt-get update && apt-get install -y git-core curl python

# --- nodejs ---

# clone
RUN mkdir -p /repos
WORKDIR /repos
RUN git clone https://github.com/isaacs/nave.git

# install
WORKDIR /repos/nave
RUN ./nave.sh usemain 4.4.7

# -- directories --

# create app directory
RUN mkdir -p /repos/placeholder
WORKDIR /repos/placeholder

# --- update npm modules --

# npm i
COPY package.json /repos/placeholder/package.json
WORKDIR /repos/placeholder/server
RUN npm install

# --- source code --

# copy files
COPY . /repos/placeholder

# -- external API --

# set entry point
WORKDIR /repos/placeholder
CMD [ "npm", "start" ]
