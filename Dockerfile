# base image
FROM pelias/baseimage

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
