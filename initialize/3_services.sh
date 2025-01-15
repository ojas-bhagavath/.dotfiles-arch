#!/bin/bash

sudo systemctl enable warp-svc.service
sudo systemctl enable paccache.timer
systemctl --user enable syncthing.service
