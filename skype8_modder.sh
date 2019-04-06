#!/bin/sh

echo "Checking if Node.js is installed"
if ! command -v node >/dev/null; then
  echo "Install Node.js, e.g. sudo apt install nodejs npm"
  return 1
fi

echo "Checking if asar is installed"
if ! command -v asar >/dev/null; then
  echo "Installing asar"

  echo "Checking if npm is installed"
  if ! command -v npm >/dev/null; then
    echo "Install npm, e.g. sudo apt install npm"
    return 1
  fi

  npm install -g asar
fi

node skype_modder.js
