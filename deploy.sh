#!/usr/bin/bash

function exitIfError {
  if [ $? -ne 0 ]; then
    echo "$1"
    exit 1
  fi
}

git pull
exitIfError "git pull failed"

docker-compose down          # Stop and clean up
# docker-compose up --build    # Rebuild and restart
docker compose up -d

# npm i
# exitIfError "npm install failed"
#
# npm run build
# exitIfError "npm run build failed"
#
# pm2 delete yankPaste
# pm2 start npm --name yankPaste -- start
# exitIfError "error with pm2"
# pm2 save
