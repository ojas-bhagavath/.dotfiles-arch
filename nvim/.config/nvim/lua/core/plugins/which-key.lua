return {
    "folke/which-key.nvim",
    event = "VeryLazy",
    init = function()
        vim.o.timeout = true
        vim.o.timeoutlen = 200
    end,
    opts = {
        plugins = { spelling = true },
    },
    config = function()
        local wk = require("which-key")
        wk.register({
            ["<leader>b"] = {
                name = "+buffers",
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
            ["<leader>q"] = {
                name = "+sessions",
            },
            ["<leader>s"] = {
                name = "+splits",
            },
            ["<leader>t"] = {
                name = "+tabs",
            },
        })
    end,
}
