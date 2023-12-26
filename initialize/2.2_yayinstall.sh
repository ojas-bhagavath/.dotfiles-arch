#!/bin/bash
yay -S $(sed "s/\s.*//g" pkglist.txt | sort) --answerclean All --answerdiff None --removemake --cleanafter --noredownload --sudo --sudoloop


