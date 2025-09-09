# Completions:
source "$ZDOTDIR/zsh-completions"
#
# Functions:
source "$ZDOTDIR/zsh-functions"

# Aliases:
source "$ZDOTDIR/zsh-aliases"

# Keybinds:
source "$ZDOTDIR/zsh-bindkeys"

# Options:
source "$ZDOTDIR/zsh-options"

# Plugins
source "$ZDOTDIR/zsh-plugins"

# Cursor
source "$ZDOTDIR/zsh-cursor"

# Misc
eval "$(starship init zsh)"
eval "$(zoxide init zsh)"
source <(fzf --zsh)

# TMUX
if command -v tmux &> /dev/null && [ -n "$PS1" ] && [[ ! "$TERM" =~ screen ]] && [[ ! "$TERM" =~ tmux ]] && [ -z "$TMUX" ]; then
  exec tmux new-session
fi
