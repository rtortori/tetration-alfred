#!/bin/bash

# Stop Alfred containers
for i in $(docker ps -a | grep alfred | awk '{print $1}'); do docker kill $i && docker rm $i; done 
