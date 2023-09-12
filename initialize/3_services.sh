#!/bin/bash
# The following enables a few important services
sudo systemctl enable NetworkManager
sudo systemctl enable bluetooth
sudo systemctl enable warp-svc.service
sudo systemctl enable ly.service
sudo systemctl enable sshd
sudo systemctl enable tlp
sudo systemctl enable reflector.timer
sudo systemctl enable fstrim.timer
sudo systemctl enable acpid
sudo systemctl enable ntp.service 
timedatectl set-ntp true
