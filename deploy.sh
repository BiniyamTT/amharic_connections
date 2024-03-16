#!/bin/bash

rm -rf ~/current
mkdir current
cd current
git clone https://github.com/BiniyamTT/amharic_connections.git
cd amharic_connections
cp app.py ~/amharic_connections/
cp -r static/ ~/amharic_connections/
cp -r templates/ ~/amharic_connections/
cd ~/amharic_connections/
source venv/bin/activate
systemctl restart nginx
supervisorctl reload
deactivate
