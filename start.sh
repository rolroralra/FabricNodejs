#!/bin/bash


rm -rf ./wallet

node enrollAdmin.js

node registerUser.js

node server.js 
