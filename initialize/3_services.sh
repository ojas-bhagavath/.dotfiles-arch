#!/bin/sh

sudo systemctl enable warp-svc.service
systemctl --user enable syncthing.service
