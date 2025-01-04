# .dotfiles-arch

![https://github.com/ojas-bhagavath/.dotfiles-arch/docs/machine.png]

This is a repository containing my dotfiles to my [Arch Linux](https://archlinux.org/) machine with [KDE Plasma](https://kde.org/plasma-desktop/) DE.

Although this repository is **not meant to be copied directly** as everything is tuned to my personal preferences, clone it if you wish to do so.

## Installation

#### Requirements:

- A system running Arch Linux (obviously)
- git
- stow

#### Clone:

```sh
# This clones the my neovim configuration along with .dotfiles
git clone --recurse-submodules https://github.com/ojas-bhagavath/.dotfiles-arch ~/.dotfiles
```

#### Initialize:

Assuming you are on a fresh install of arch, these scripts installs all the software that I generally like on my system, and run some scripts that I run on a fresh install of Arch.

```sh
cd ~/.dotfiles/initialize/
chmod +x *.sh

# This modifies pacman config to allow for faster downloads and other perks.
./0_pacmod.sh
# Run this only if you don't want AUR packages, otherwise redundant.
./1_pacinstall.sh
# This installs yay helper to install AUR packages.
./2.1_installyay.sh
# This installs all the packages mentioned in pkglist.txt, be sure to edit that before you  run this, and run this at your  own risk as AUR packages may break your system
./2.2_yayinstall.sh
# This installs the some flatpaks.
2.3_flatpaks.sh
# This enables certain necessary services.
3_services.sh
# These are some miscellaneous commands that I like to run post initialization.
4_misc.sh
```

#### Stow

This symlinks config files from .dotfiles directory to appropriate places

```sh
cd ~/.dotfiles/

stow foot
stow fuzzel
stow keepassxc
stow lazygit
stow mpv
stow newsboat
stow nvim
stow qutebrowser
stow scripts
stow sioyek
stow starship
stow tmux
stow wezterm
stow yazi
stow zsh
```
