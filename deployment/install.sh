#!/usr/bin/env bash
set -e

# install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash

# activate nvm
. ~/.nvm/nvm.sh

# install a version of nodejs
nvm install 8

# install pm2 module globaly
npm install -g pm2
pm2 update
