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
export EDITOR="neovide"
export VISUAL="neovide"

# zsh specific variables
ZDOTDIR="$XDG_CONFIG_HOME/zsh"
HISTFILE="$XDG_CACHE_HOME/.zhistory"
HISTSIZE=10000000
SAVEHIST=10000000
HISTDUP=erase
ZSH_EXPAND_ALL_DISABLE=word

# FZF
export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS --highlight-line --info=inline-right --ansi --layout=reverse --border=none --color=bg+:#283457 --color=bg:#16161e --color=border:#27a1b9 --color=fg:#c0caf5 --color=gutter:#16161e --color=header:#ff9e64 --color=hl+:#2ac3de --color=hl:#2ac3de --color=info:#545c7e --color=marker:#ff007c --color=pointer:#ff007c --color=prompt:#2ac3de --color=query:#c0caf5:regular --color=scrollbar:#27a1b9 --color=separator:#ff9e64 --color=spinner:#ff007c"

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
export LEDGER_FILE="$HOME/Stuff/Finance/transactions.journal"
export PNPM_HOME="/home/ojas/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# PATH
export PATH="$PATH:$CARGO_HOME/bin"
export PATH="$PATH:$HOME/.elan/bin/"
export PATH="$PATH:$HOME/.local/bin"
export PATH="$PATH:$HOME/.scripts/"
