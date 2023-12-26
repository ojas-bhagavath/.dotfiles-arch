#!/bin/bash

sudo pacman -S $(comm -12 <(pacman -Slq | sort) <(sed "s/\s.*//g" pkglist.txt | sort)) --needed
