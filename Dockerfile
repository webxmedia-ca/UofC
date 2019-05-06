# got this dockerfile built based on:
#https://github.com/browserstack/browserstack-docker-example/blob/master/Dockerfile
#FROM node:8.12-slim    #https://hub.docker.com/_/node?tab=tags&page=16
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

#RUN ["npm", "install"]
RUN npm install

#the one below - not sure if needed !!!!!!
LABEL license=MIT version=$VERSION authors=ValeriuJecov Description="This image is used to do run automation testing" Vendor="WebXMedia"

#new stuff --------------------------------------------------------:
#without this stuff, manually runnning the tests won't work (from bash cmd)
#COPY .jshintrc /ucautomation
#COPY browserstack.json /ucautomation
#COPY GruntFile.js /ucautomation
#COPY LICENSE /ucautomation
#COPY README.md /ucautomation

#RUN mkdir -p config; mkdir -p grunt; mkdir -p lib;
#COPY config config/
#COPY grunt grunt/
#COPY lib lib/


##### --------------------- NOT SURE THE ONES BELOW ARE NEEDED --------------------- #####
#the files below - I am not sure if they are needed:
#COPY .gitlab-ci.yml
#COPY .gitignore
#COPY Dockerfile
#COPY .dockerignore
#COPY docker-compose.yml
#COPY ucautomation.iml /ucautomation

#RUN mkdir -p /ucautomation/lib/basic-auth-chrome-proxy
#COPY lib /ucautomation/lib/basic-auth-chrome-proxy
#RUN mkdir -p /ucautomation/lib/basic-auth-chrome-proxy/app-internal-proxy
#COPY lib /ucautomation/lib/basic-auth-chrome-proxy/app-internal-proxy
#RUN mkdir -p /ucautomation/lib/ext
#COPY lib /ucautomation/lib/ext

#RUN mkdir -p /ucautomation/lib/UofC
#COPY lib/UofC /ucautomation/lib/UofC/
#COPY lib/UofC/Grid.js /ucautomation/lib/UofC
#COPY lib/harness.js /ucautomation/lib/
#COPY lib/harness-json.js /ucautomation/lib/
#COPY lib/jira-updater.js /ucautomation/lib/
#COPY lib/UofCApps-base.js /ucautomation/lib/
#COPY lib/UofCApps.js /ucautomation/lib/
#####--------------------------------------------------------------------------------#####


#RUN mkdir -p reporters; mkdir -p screen-caps; mkdir -p tests;
#COPY reporters reporters/
#COPY screen-caps screen-caps/
#COPY tests tests/

#RUN ["npm", "install"]
#RUN npm install

#next line will copy the entire content of the ucautomation folder into the docker image
# ignoring the files & folders specified in the '.dockerignore' file
COPY . /ucautomation