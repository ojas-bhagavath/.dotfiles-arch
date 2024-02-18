#!/bin/bash

sudo cp -f "$HOME"/.dotfiles/initialize/src/ly/config.ini /etc/ly/config.ini
xdg-settings set default-web-browser org.qutebrowser.qutebrowser.desktop
echo ""
echo "You may Reboot now."
