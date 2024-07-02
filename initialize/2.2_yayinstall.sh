#!/bin/sh

yay -S --needed $(sed "s/\s.*//g" pkglist.txt | sort)
