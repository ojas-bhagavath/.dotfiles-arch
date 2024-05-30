return {
    "NvChad/nvim-colorizer.lua",
    event = { "BufReadPost", "BufWritePost", "BufNewFile" },
    opts = {
        filetypes = { "*" },
        user_default_options = {
            mode = "background",
            RGB = true,
            names = false,
            RRGGBBAA = true,
            AARRGGBB = true,
            rgb_fn = true,
            hsl_fn = true,
            css = true,
            css_fn = true,
        },
        buftypes = {},
    },
}
