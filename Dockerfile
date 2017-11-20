# base image
FROM pelias/baseimage

# downloader apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y build-essential python jq && rm -rf /var/lib/apt/lists/*

# clone repo
RUN git clone https://github.com/pelias/placeholder.git /code/pelias/placeholder

# change working dir
ENV WORKDIR /code/pelias/placeholder
WORKDIR ${WORKDIR}

# copy code from local checkout
ADD . ${WORKDIR}

ENV WOF_DIR '/data/whosonfirst/data'
ENV PLACEHOLDER_DATA '/data/placeholder'

# install npm dependencies
RUN npm install

RUN export extract_file=${PLACEHOLDER_DATA}/wof.extract

CMD [ "npm", "start" ]
