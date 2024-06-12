# Completions:
source "$ZDOTDIR/zsh-completions"

# Aliases:
source "$ZDOTDIR/zsh-aliases"

# Keybinds:
source "$ZDOTDIR/zsh-bindkeys"

# Functions:
source "$ZDOTDIR/zsh-functions"

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
eval "$(fzf --zsh)"
