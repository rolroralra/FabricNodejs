#!/bin/bash

PROC_HOME_DIR=$(dirname $(realpath $0))

rm -rf ${PROC_HOME_DIR}/wallet

node enrollAdmin.js

node registerUser.js

node server.js 
