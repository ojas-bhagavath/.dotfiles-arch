# Lines configured by zsh-newuser-install
HISTFILE="$HOME/.histfile"
HISTSIZE=1000000
SAVEHIST=1000000
unsetopt autocd beep extendedglob nomatch
bindkey -v
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/ojas/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

# some useful options (man zshoptions)
setopt autocd extendedglob nomatch menucomplete
setopt interactive_comments
stty stop undef		# Disable ctrl-s to freeze terminal.
zle_highlight=('paste:none')

# beeping is annoying
unsetopt BEEP

# exports
export ZDOTDIR=$HOME/.config/zsh/
export XDG_CONFIG_HOME=$HOME/.config/
export XDG_CACHE_HOME=$HOME/.cache/
export XDG_DATA_HOME=$HOME/.local/share/ 
export TERM=alacritty
export TERMINAL=alacritty
export PATH=$HOME.local/bin:$PATH
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="$HOME/.scripts:$PATH"
export GPG_TTY=$(tty)
export SHELL=/bin/zsh

# keybindings
bindkey  "^[[H"   beginning-of-line
bindkey  "^[[F"   end-of-line
bindkey  "^[[3~"  delete-char
bindkey  "^?"   backward-delete-char

# functions
source "$ZDOTDIR/zsh-functions"

# Normal files to source
zsh_add_file "zsh-vim-mode"

# completions
autoload -Uz compinit
zstyle ':completion:*' menu select
# zstyle ':completion::complete:lsof:*' menu yes select
zmodload zsh/complist
# compinit
_comp_options+=(globdots)		# Include hidden files.

autoload -U up-line-or-beginning-search
autoload -U down-line-or-beginning-search
zle -N up-line-or-beginning-search
zle -N down-line-or-beginning-search

# Colors
autoload -Uz colors && colors

# Aliases
alias :q="exit"
alias la="exa --oneline --icons --git --group-directories-first --long --all"
alias ls="ls"
alias lf="lf"
alias tree="exa --tree"
alias ytv='yt-dlp -i --download-archive "$HOME/YouTube/downloaded-videos.txt" -o "$HOME/YouTube/%(title)s.%(ext)s" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" '
alias yta='yt-dlp --prefer-ffmpeg --extract-audio --audio-format mp3 --audio-quality 0 -i --download-archive "$HOME/YouTube/downloaded-audios.txt" -o "$HOME/YouTube/%(title)s.%(ext)s" '
alias "pass show"="pass show -c"
function note {
    echo "date: $(date)" >> $HOME/note.txt
    echo "$@" >> $HOME/note.txt
    echo "" >> $HOME/note.txt
}
function take {
    mkdir -p $1
    cd $1
}
alias rm=trash


# Plugins and additional stuff
zsh_add_plugin "zsh-users/zsh-autosuggestions"
zsh_add_plugin "zsh-users/zsh-syntax-highlighting"
zsh_add_plugin "zsh-users/zsh-completions"
zsh_add_plugin "pasky/speedread"
zsh_add_completion "nix-community/nix-zsh-completions"
eval "$(starship init zsh)"
eval "$(zoxide init zsh)"
eval "$(thefuck --alias)"
# zsh_add_file "zsh-prompt"


