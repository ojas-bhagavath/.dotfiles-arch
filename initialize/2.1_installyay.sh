#!/bin/bash

# This installs base-devel package that contains several tools required for making and building, and also installs git
sudo pacman -S --needed base-devel git

# This clones the git repo of arch to $HOME/yay
git clone https://aur.archlinux.org/yay.git $HOME/yay

# This cd into the created folder
cd $HOME/yay

# This makes installs yay on your machine
makepkg -si

# Removes the yay folder, one must clean after themseleves
rm -rf $HOME/yay
