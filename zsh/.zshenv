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
export EDITOR="$TERM nvim"
export VISUAL="$TERM nvim"

# zsh specific variables
export ZDOTDIR="$XDG_CONFIG_HOME/zsh"
export HISTFILE="$XDG_CACHE_HOME/.zhistory"
export HISTSIZE=1000000
export SAVEHIST=1000000


# FZF
export FZF_DEFAULT_OPTS=" \
--color=bg+:#313244,bg:#1e1e2e,spinner:#f5e0dc,hl:#f38ba8 \
--color=fg:#cdd6f4,header:#f38ba8,info:#cba6f7,pointer:#f5e0dc \
--color=marker:#f5e0dc,fg+:#cdd6f4,prompt:#cba6f7,hl+:#f38ba8"

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

# PATH
export PATH="$PATH:$HOME/.local/bin"
export PATH="$PATH:$CARGO_HOME/bin"
export PATH="$PATH:$HOME/.scripts"
