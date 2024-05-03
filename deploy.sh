#!/usr/bin/bash

npm i
if [ $? -ne 0 ]; then
  echo "npm install failed"
  exit 1
fi
pm2 kill
npm run build
if [ $? -ne 0 ]; then
  echo "npm run build failed"
  exit 1
fi

pm2 start npm --name yankPaste -- start
pm2 save
