#! /bin/bash

nohup /BrowserStackLocal --key c8EHLyzv9zWTJ2zGRedY --force-local --local-identifier=$1 > /tmp/nohup.out 2>&1 &
