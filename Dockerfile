# got this dockerfile built based on:
#https://github.com/browserstack/browserstack-docker-example/blob/master/Dockerfile
FROM node:8.12.0

#change the loglevel (https://docs.npmjs.com/misc/config):
#Default: “notice”  ///  #Values: “silent”, “error”, “warn”, “notice”, “http”, “timing”, “info”, “verbose”, “silly”
#ENV NPM_CONFIG_LOGLEVEL info
#ENV NPM_CONFIG_LOGLEVEL warn

#not sure if needed  - maybe to use later, increase the version
ARG VERSION=1.0.0

# Copy the application files
RUN mkdir -p /ucautomation
WORKDIR /ucautomation
COPY package.json /ucautomation

#the one below - not sure if needed !!!!!!
LABEL license=MIT version=$VERSION authors=ValeriuJecov

RUN ["npm", "install"]

#new stuff --------------------------------------------------------:
#without this stuff, manually runnning the test won't work (from bash cmd)
COPY .jshintrc /ucautomation
COPY browserstack.json /ucautomation
COPY GruntFile.js /ucautomation
COPY LICENSE /ucautomation
COPY README.md /ucautomation
#below - not sure if needed
#COPY ucautomation.iml /ucautomation

#COPY . /ucautomation
RUN mkdir -p /ucautomation/config
COPY config /ucautomation/config

RUN mkdir -p /ucautomation/grunt
COPY grunt /ucautomation/grunt

RUN mkdir -p /ucautomation/lib
COPY lib /ucautomation/lib

RUN mkdir -p /ucautomation/reporters
COPY reporters /ucautomation/reporters

RUN mkdir -p /ucautomation/screen-caps
COPY screen-caps /ucautomation/screen-caps

RUN mkdir -p /ucautomation/tests
COPY tests /ucautomation/tests