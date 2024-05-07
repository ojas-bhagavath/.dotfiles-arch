#!/bin/sh

# This adds a few lines at a particular place /etc/pacman.conf
if  sudo cat /etc/pacman.conf | grep -q "ILoveCandy" 
then
    echo "Done!"
else
    sed "/Misc/a ParallelDownloads = 100" /etc/pacman.conf > "$HOME"/temp.txt
    sed "/Misc/a Color" "$HOME"/temp.txt > "$HOME"/temp2.txt
    sed "/Misc/a ILoveCandy" "$HOME"/temp2.txt > "$HOME"/temp3.txt
    sudo cp "$HOME"/temp3.txt /etc/pacman.conf
    rm "$HOME"/temp.txt "$HOME"/temp2.txt "$HOME"/temp3.txt
fi

# The following alters pacman mirror list
sudo pacman -Sy reflector
sudo systemctl enable reflector.timer
sudo systemctl start reflector.timer
sudo reflector --latest 10 --country India,Srilanka --age 24 --protocol http,https --sort rate --download-timeout 60 --save /etc/pacman.d/mirrorlist
