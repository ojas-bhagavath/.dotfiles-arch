---@type ChadrcConfig 
 local M = {}
 M.ui = {
    theme = "catppuccin",
    theme_toggle = { "catppuccin", "ayu_light" },
    transparency = true,
    tabufline = {
        lazyload = false,
    },
    
    nvdash = {
        load_on_startup = true,

        header = {
            "███╗░░██╗███████╗░█████╗░██╗░░░██╗██╗███╗░░░███╗",
            "████╗░██║██╔════╝██╔══██╗██║░░░██║██║████╗░████║",
            "██╔██╗██║█████╗░░██║░░██║╚██╗░██╔╝██║██╔████╔██║",
            "██║╚████║██╔══╝░░██║░░██║░╚████╔╝░██║██║╚██╔╝██║",
            "██║░╚███║███████╗╚█████╔╝░░╚██╔╝░░██║██║░╚═╝░██║",
            "╚═╝░░╚══╝╚══════╝░╚════╝░░░░╚═╝░░░╚═╝╚═╝░░░░░╚═╝",
        },

        buttons = {
            { "  New File", "Spc b", "enew" },
            { " Find File", "Spc f f", "Telescope find_files"},
            { "󰔚  Recently Used Files", "Spc f o", "Telescope oldfiles" },
            { "󰈭  Find Word", "Spc f w", "Telescope live_grep" },
            { "  Bookmarks", "Spc m a", "Telescope marks" },
            { "  Themes", "Spc t h", "Telescope themes" },
            { "  Mappings", "Spc c h", "NvCheatsheet" },
        },
    },
 }

 M.mappings = require "custom.mappings"

 return M
