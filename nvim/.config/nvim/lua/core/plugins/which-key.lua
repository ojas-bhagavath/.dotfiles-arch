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
            { "<leader><tab>", group = "tab", icon = "󰓩" },
            { "<leader>U", group = "undo", icon = "󰕍" },
            { "<leader>b", group = "buffer", icon = "" },
            { "<leader>c", group = "code", icon = "" },
            { "<leader>e", group = "yazi", icon = "󰇥" },
            { "<leader>f", group = "find/file", icon = "" },
            { "<leader>g", group = "git", icon = "" },
            { "<leader>l", group = "lazy", icon = "󰒲" },
            { "<leader>o", group = "options/toggle", icon = "" },
            { "<leader>q", group = "sessions", icon = "" },
            { "<leader>r", group = "reload", icon = "󰑓" },
            { "<leader>s", group = "split", icon = "" },
            { "<leader>t", group = "terminal", icon = "" },
            { "<leader>u", group = "ui" },
            { "<leader>?", group = "which-key", icon = "" },
        })
    end,
}
