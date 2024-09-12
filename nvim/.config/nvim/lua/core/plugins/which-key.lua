return {
    "folke/which-key.nvim",
    event = "VeryLazy",
    opts = {
        -- your configuration comes here
        -- or leave it empty to use the default settings
        -- refer to the configuration section below
    },
    keys = {
        {
            "<leader>?",
            function()
                require("which-key").show({ global = false })
            end,
            desc = "Buffer Local Keymaps (which-key)",
        },
    },
    config = function()
        local wk = require("which-key")
        wk.add({
            { "<leader>T", group = "terminal" },
            { "<leader>b", group = "buffer" },
            { "<leader>f", group = "find/file" },
            { "<leader>g", group = "git" },
            { "<leader>q", group = "sessions" },
            { "<leader>s", group = "split" },
            { "<leader>t", group = "tab" },
            { "<leader>u", group = "ui" },
        })
    end,
}
