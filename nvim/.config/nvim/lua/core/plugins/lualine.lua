return {
    "nvim-lualine/lualine.nvim",
    event = { "BufReadPost", "BufWritePost", "BufNewFile" },
    opts = {
        options = {
            component_separators = "",
            section_separators = { left = "", right = "" },
            globalstatus = true,
            disabled_filetypes = { statusline = { "dashboard", "alpha", "starter" } },
        },
        sections = {
            lualine_a = { { "mode", separator = { left = "" }, right_padding = 2 } },
            lualine_b = {},
            lualine_c = { "buffers" },
            lualine_x = {
                {
                    require("noice").api.statusline.mode.get,
                    cond = require("noice").api.statusline.mode.has,
                },
            },
            lualine_y = {},
            lualine_z = {
                { "datetime", style = "%H:%M", separator = { right = "" }, left_padding = 2 },
            },
        },
    },
}
