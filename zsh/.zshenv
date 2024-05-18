# XDG base directories
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_STATE_HOME="$HOME/.local/state"
export DOTFILES="$HOME/.dotfiles"

# terminal and editor specific variables
export TERM="foot"
export TERMINAL="foot"
export SHELL=/bin/zsh
export EDITOR="neovide"
export VISUAL="neovide"

# zsh specific variables
ZDOTDIR="$XDG_CONFIG_HOME/zsh"
HISTFILE="$XDG_CACHE_HOME/.zhistory"
HISTSIZE=10000000
SAVEHIST=10000000
HISTDUP=erase



# FZF
export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS \
--color=fg:#c8d3f5,bg:#222436,hl:#ff966c \
--color=fg+:#c8d3f5,bg+:#2f334d,hl+:#ff966c \
--color=info:#82aaff,prompt:#86e1fc,pointer:#86e1fc \
--color=marker:#c3e88d,spinner:#c3e88d,header:#c3e88d"

# Other Stuff
export GPG_TTY=$(tty)
export GNUPGHOME="$HOME"/.gnupg
export PASSWORD_STORE_DIR="$HOME/.password-store"

export RUSTUP_HOME="$XDG_DATA_HOME/rustup"
export WGETRC="$XDG_CONFIG_HOME/wgetrc"
export CARGO_HOME="$XDG_DATA_HOME/cargo"
export GOPATH="$XDG_DATA_HOME/go"
export NPM_CONFIG_USERCONFIG="$XDG_CONFIG_HOME/npm/npmrc"
export _JAVA_OPTIONS=-Djava.util.prefs.userRoot="$XDG_CONFIG_HOME/java"
export STACK_ROOT="$XDG_DATA_HOME"/stack
export STACK_XDG=1
export PARALLEL_HOME="$XDG_CONFIG_HOME"/parallel 

# PATH
export PATH="$PATH:$HOME/.local/bin"
export PATH="$PATH:$CARGO_HOME/bin"
export PATH="$PATH:$HOME/.scripts"

export OPENER=handlr
