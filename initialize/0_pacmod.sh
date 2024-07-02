#!/bin/sh

# This adds a few lines at a particular place /etc/pacman.conf
sudo cp -f src/pacman.conf /etc/pacman.conf 
# The following alters pacman mirror list

sudo pacman -Syu
sudo pacman -S --needed reflector
sudo systemctl enable reflector.timer
sudo systemctl start reflector.timer
sudo reflector --latest 10 --country India,Srilanka --age 24 --protocol http,https --sort rate --download-timeout 60 --save /etc/pacman.d/mirrorlist
