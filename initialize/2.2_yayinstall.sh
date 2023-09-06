#!/bin/bash
yay -S $(comm -12 <(yay -Slq | sort) <(awk NF $HOME/.dotfiles/scripts/pkglist.txt | awk !'/^#/' | sort)) --answerclean All --answerdiff None --needed


