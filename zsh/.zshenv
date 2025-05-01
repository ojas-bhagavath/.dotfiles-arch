# XDG base directories
export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_STATE_HOME="$HOME/.local/state"
export DOTFILES="$HOME/.dotfiles"

# terminal and editor specific variables
export TERM="kitty"
export TERMINAL="kitty"
export SHELL="/bin/zsh"
export EDITOR="nvim"
export VISUAL="nvim"

# zsh specific variables
ZDOTDIR="$XDG_CONFIG_HOME/zsh"
HISTFILE="$XDG_CACHE_HOME/.zhistory"
HISTSIZE=10000000
SAVEHIST=10000000
HISTDUP=erase

# FZF
export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS \
  --highlight-line \
  --info=inline-right \
  --ansi \
  --layout=reverse \
  --border=none \
  --color=bg+:#2d3f76 \
  --color=bg:#1e2030 \
  --color=border:#589ed7 \
  --color=fg:#c8d3f5 \
  --color=gutter:#1e2030 \
  --color=header:#ff966c \
  --color=hl+:#65bcff \
  --color=hl:#65bcff \
  --color=info:#545c7e \
  --color=marker:#ff007c \
  --color=pointer:#ff007c \
  --color=prompt:#65bcff \
  --color=query:#c8d3f5:regular \
  --color=scrollbar:#589ed7 \
  --color=separator:#ff966c \
  --color=spinner:#ff007c \
"

# Other Stuff
export GNUPGHOME="$HOME"/.gnupg
export GPG_TTY=$(tty)
export PASSWORD_STORE_DIR="$HOME/.password-store"

export CARGO_HOME="$XDG_DATA_HOME/cargo"
export GOPATH="$XDG_DATA_HOME/go"
export NPM_CONFIG_USERCONFIG="$XDG_CONFIG_HOME/npm/npmrc"
export PARALLEL_HOME="$XDG_CONFIG_HOME"/parallel 
export RUSTUP_HOME="$XDG_DATA_HOME/rustup"
export STACK_ROOT="$XDG_DATA_HOME"/stack
export STACK_XDG=1
export _JAVA_OPTIONS=-Djava.util.prefs.userRoot="$XDG_CONFIG_HOME/java"

# PATH
export PATH="$PATH:$CARGO_HOME/bin"
export PATH="$PATH:$HOME/.elan/bin/"
export PATH="$PATH:$HOME/.local/bin"
export PATH="$PATH:$HOME/.scripts/"
