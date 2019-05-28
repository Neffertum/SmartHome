#!/usr/bin/env bash
set -e

CURRENT_DIR=`pwd`
SCRIPT_DIR=$(dirname "$0")

SRV_NAME=smart-home
TARGET_SRV_DIR=/var/www/$SRV_NAME

sudo echo -e "\033[1;4;32m[SmartHome]\033[0m Setting Up Node Link"
if [ ! -f /usr/bin/node ] && [ ! -f /usr/local/bin/node ]; then
  sudo ln -s "$(which node)" /usr/bin/node
fi

echo -e "\033[1;4;32m[SmartHome]\033[0m Starting Update"
echo -e "\033[1;4;32m[SmartHome]\033[0m Installing Dependencies"

cd $SCRIPT_DIR
rm -rf node_modules
yarn install --production

if service --status-all | grep -Fq $SRV_NAME; then
  echo -e "\033[1;4;32m[SmartHome]\033[0m Stoping Service"
  sudo systemctl stop $SRV_NAME
fi

echo -e "\033[1;4;32m[SmartHome]\033[0m Installing Service"
sudo mkdir -p $TARGET_SRV_DIR
sudo cp systemd/$SRV_NAME.service /etc/systemd/system/
sudo cp -r bin $TARGET_SRV_DIR
sudo cp -r public $TARGET_SRV_DIR
sudo cp -r node_modules $TARGET_SRV_DIR

sudo cp .env $TARGET_SRV_DIR
sudo cp app.js $TARGET_SRV_DIR
sudo cp config.js $TARGET_SRV_DIR

sudo chmod +x $TARGET_SRV_DIR/bin/www

sudo systemctl daemon-reload
echo -e "\033[1;4;32m[SmartHome]\033[0m Installation Complete!"

echo -e "\033[1;4;32m[SmartHome]\033[0m Starting Service"
sudo systemctl start $SRV_NAME
cd $CURRENT_DIR
