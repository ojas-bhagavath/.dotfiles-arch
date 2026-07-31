#!/bin/bash

sudo sed -i 's/GRUB_TIMEOUT=.*/GRUB_TIMEOUT=0/g' /etc/default/grub
sudo grub-mkconfig -o /boot/grub/grub.cfg

sudo cp -f src/config.toml /etc/greetd/config.toml
sudo cp -f src/greeter.toml /var/lib/noctalia-greeter/greeter.toml
