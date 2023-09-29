#!/bin/bash

sudo pacman -S $(comm -12 <(pacman -Slq | sort) <(awk NF $HOME/.dotfiles/initialize/pkglist.txt | awk !'/^#/' | sort)) --needed
