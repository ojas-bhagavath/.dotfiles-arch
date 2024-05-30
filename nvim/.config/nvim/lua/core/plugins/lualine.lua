return {
    "nvim-lualine/lualine.nvim",
    event = { "VeryLazy" },
    init = function()
        vim.g.lualine_laststatus = vim.o.laststatus
        if vim.fn.argc(-1) > 0 then
            vim.o.statusline = " "
        else
            vim.o.laststatus = 0
        end
    end,
    opts = function()
        local colors = {
            red = "#ff757f",
            green = "#c3e88d",
            blue = "#82aaff",
            cyan = "#86e1fc",
            magenta = "#c099ff",
            yellow = "#ffc777",
            white = "#c8d3f5",
            grey = "#2d3f76",
            black = "#1b1d2b",
        }

        local tokyonight_moon = {
            normal = {
                a = { fg = colors.black, bg = colors.magenta },
                b = { fg = colors.white, bg = colors.grey },
                c = { fg = colors.white },
            },
            insert = { a = { fg = colors.black, bg = colors.green } },
            visual = { a = { fg = colors.black, bg = colors.cyan } },
            replace = { a = { fg = colors.black, bg = colors.red } },
            command = { a = { fg = colors.black, bg = colors.yellow } },
            inactive = {
                a = { fg = colors.white, bg = colors.black },
                b = { fg = colors.white, bg = colors.black },
                c = { fg = colors.white },
            },
        }
        local lazy_status = require("lazy.status")
        require("lualine").setup({
            options = {
                theme = tokyonight_moon,
                component_separators = "",
                section_separators = { left = "", right = "" },
                globalstatus = true,
                disabled_filetypes = { statusline = { "dashboard", "alpha", "starter" } },
            },
            sections = {
                lualine_a = { { "mode", separator = { left = "" }, right_padding = 2 } },
                lualine_b = { "filename" },
                lualine_c = { "branch" },
                lualine_x = {},
                lualine_y = { "filetype", "progress" },
                lualine_z = {
                    { "datetime", style = "%H:%M", separator = { right = "" }, left_padding = 2 },
                },
            },
            inactive_sections = {
                lualine_a = { "filename" },
                lualine_b = {},
                lualine_c = {},
                lualine_x = {},
                lualine_y = {},
                lualine_z = { "location" },
            },
            tabline = {},
            extensions = {},
        })
    end,
}
