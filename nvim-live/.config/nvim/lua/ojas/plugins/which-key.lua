return {
    "folke/which-key.nvim",
    event = "VeryLazy",
    init = function()
        vim.o.timeout = true
        vim.o.timeoutlen = 500
    end,
    opts = {
        plugins = { spelling = true },
    },
    config = function()
        local wk = require("which-key")
        wk.register({
            ["<leader>b"] = {
                name = "+buffer",
            },
            ["<leader>c"] = {
                name = "+code",
            },
            ["<leader>f"] = {
                name = "+find/file",
            },
            ["<leader>g"] = {
                name = "+git",
            },
            ["<leader>s"] = {
                name = "+split",
            },
            ["<leader>t"] = {
                name = "+tabs",
            },
        })
    end,
}
