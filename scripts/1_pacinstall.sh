#!/bin/bash

sudo pacman -S $(comm -12 <(pacman -Slq | sort) <(awk NF $HOME/.dotfiles/scripts/pkglist.txt | awk !'/^#/' | sort)) --needed
