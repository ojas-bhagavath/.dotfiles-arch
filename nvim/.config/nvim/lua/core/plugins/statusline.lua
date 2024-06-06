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
            lualine_x = {},
            lualine_y = {},
            lualine_z = {
                { "datetime", style = "%H:%M", separator = { right = "" }, left_padding = 2 },
            },
        },
    },
}
