return {
    {
        "folke/tokyonight.nvim",
        lazy = false,
        priority = 1000,
        opts = {
            style = "moon",
            transparent = true,
            styles = {
                sidebars = "transparent",
                floats = "transparent",
            },
        },
        config = function()
            vim.cmd([[colorscheme tokyonight-moon]])
            require("tokyonight").setup({
                on_highlights = function(hl, c)
                    local header = "#ffc777"
                    hl.DashboardHeader = {
                        fg = header,
                    }
                end,})
            end,
        },
    }
