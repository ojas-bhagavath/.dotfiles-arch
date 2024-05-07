#!/bin/sh

yay -S $(sed "s/\s.*//g" pkglist.txt | sort)
