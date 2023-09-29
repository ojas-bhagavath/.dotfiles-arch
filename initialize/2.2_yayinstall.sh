#!/bin/bash
yay -S $(comm -12 <(yay -Slq | sort) <(awk NF $HOME/.dotfiles/initialize/pkglist.txt | awk !'/^#/' | sort)) --answerclean All --answerdiff None --needed


