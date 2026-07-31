#!/bin/bash

sudo systemctl enable warp-svc.service
sudo systemctl enable paccache.timer
sudo systemctl enable greetd.service
systemctl --user enable syncthing.service
