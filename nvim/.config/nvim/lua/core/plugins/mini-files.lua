return {
    "echasnovski/mini.files",
    version = false,
    dependencies = { "nvim-tree/nvim-web-devicons" },
    -- event = "VeryLazy",
    opts = {
        mappings = {
            go_in = "L",
            go_in_plus = "l",
        },
        options = {
            permanent_delete = false,
            use_as_default_explorer = false,
        },
    },
    keys = {
        {
            "<leader>e",
            function()
                if not MiniFiles.close() then
                    MiniFiles.open(vim.api.nvim_buf_get_name(0), false)
                end
            end,
            desc = "File Explorer (cwd)",
        },
        {
            "<leader>E",
            function()
                if not MiniFiles.close() then
                    MiniFiles.open(vim.fn.expand("$HOME/"), false)
                end
            end,
            desc = "File Explorer (cwd)",
        },
    },
}
