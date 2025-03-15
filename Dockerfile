# base image
FROM pelias/baseimage

# downloader apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y jq lbzip2 parallel && rm -rf /var/lib/apt/lists/*

# change working dir
ENV WORKDIR /code/pelias/placeholder
WORKDIR ${WORKDIR}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORK}
RUN npm install

# copy code from local checkout
ADD . ${WORKDIR}

ENV PLACEHOLDER_DATA '/data/placeholder'

USER pelias

CMD [ "./cmd/server.sh" ]
