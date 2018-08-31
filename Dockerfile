# base image
FROM pelias/baseimage

# downloader apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y build-essential python jq && rm -rf /var/lib/apt/lists/*

# default to development, production builds can change this with a build arg
ARG NODE_ENV=development

# change working dir
ENV WORKDIR /code/pelias/placeholder
WORKDIR ${WORKDIR}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORK}
RUN npm install

# copy code from local checkout
ADD . ${WORKDIR}

# run tests if not building a production image
RUN if [ "$NODE_ENV" != "production" ]; then npm test; fi

ENV WOF_DIR '/data/whosonfirst/data'
ENV PLACEHOLDER_DATA '/data/placeholder'

CMD [ "./cmd/server.sh" ]
