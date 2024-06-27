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
 # eval "$(oh-my-posh init zsh --config ~/.config/ohmyposh/config.omp.json)"
eval "$(zoxide init zsh)"
source <(fzf --zsh)
