#!/usr/bin/bash

function exitIfError {
  if [ $? -ne 0 ]; then
    echo "$1"
    exit 1
  fi
}

git pull
exitIfError "git pull failed"

docker compose down
docker compose up --build -d   # -d = detached mode (runs in background)
