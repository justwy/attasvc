#!/usr/bin/env bash
source ~/.bashrc

cd ~/node
pm2 stop www || true
