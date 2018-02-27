#!/bin/bash

# Start Alfred
docker run -t --mount source=alfred-vol,target=/tetration-alfred -p 5000:5000 alfred
