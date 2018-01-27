#!/usr/bin/env bash

source ~/.bashrc

cd ~/node
pm2 start bin/www -n www -i 0
