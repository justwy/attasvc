#!/usr/bin/env bash

cd ~/node
pm2 start bin/www -n www -i 0
