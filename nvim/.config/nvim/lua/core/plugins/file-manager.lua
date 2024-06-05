return {
    "mikavilpas/yazi.nvim",
    dependencies = {
        "nvim-lua/plenary.nvim",
    },
    keys = {
        -- 👇 in this section, choose your own keymappings!
        {
            "<leader>e",
            function()
                require("yazi").yazi()
            end,
            desc = "Open the file manager",
        },
        {
            -- Open in the current working directory
            "<leader>E",
            function()
                require("yazi").yazi(nil, vim.fn.expand("$HOME/"))
            end,
            desc = "Open the file manager in nvim's working directory",
        },
    },
    opts = {
        open_for_directories = true,
    },
    config = function()
        require("yazi").setup()
    end,
}
