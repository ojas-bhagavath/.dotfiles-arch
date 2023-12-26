#!/bin/bash

echo $(comm -12 <(pacman -Slq | sort) <(sed "s/\s.*//g" pkglist.txt | sort))
