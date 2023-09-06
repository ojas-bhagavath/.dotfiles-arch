#!/usr/bin/env sh
HYPRGAMEMODE=$(hyprctl getoption general:gaps_in | awk 'NR==2{print $2}')
if [ "$HYPRGAMEMODE" = 0 ] ; then
    hyprctl --batch "\
        keyword general:gaps_in 7;\
        keyword general:gaps_out 14;\
        keyword decoration:rounding 5"
    exit
fi
hyprctl reload
