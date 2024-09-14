return {
    "nvim-lualine/lualine.nvim",
    event = { "BufReadPost", "BufWritePost", "BufNewFile" },
    opts = {
        options = {
            icons_enabled = true,
            globalstatus = true,
            disabled_filetypes = { statusline = { "dashboard", "alpha", "starter" } },
            component_separators = "",
            section_separators = { left = "", right = "" },
        },

        sections = {
            lualine_a = {
                {
                    "mode",
                    fmt = function(str)
                        return str:sub(1, 3)
                    end,
                    separator = { right = "", left = "" },
                },
            },
            lualine_b = { "diff" },
            lualine_c = { "buffers" },
            lualine_x = { "searchcount" },
            lualine_y = { "filetype" },
            lualine_z = {
                { "datetime", style = "%H:%M", separator = { right = "", left = "" } },
            },
        },
    },
}
