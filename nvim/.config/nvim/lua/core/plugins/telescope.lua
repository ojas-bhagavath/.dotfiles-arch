return {
    "nvim-telescope/telescope.nvim",
    dependencies = {
        "nvim-lua/plenary.nvim",
        { "nvim-telescope/telescope-fzf-native.nvim", build = "make" },
        "nvim-tree/nvim-web-devicons",
    },
    cmd = "Telescope",
    version = false,
    config = function()
        local telescope = require("telescope")
        local actions = require("telescope.actions")
        telescope.setup({
            defaults = {
                path_display = { "smart" },
                mappings = {
                    i = {
                        ["<C-k>"] = actions.move_selection_previous,
                        ["<C-j>"] = actions.move_selection_next,
                    },
                },
            },
            pickers = {
                find_files = {
                    hidden = true,
                },
                oldfiles = {
                    hidden = true,
                },
                live_grep = {
                    hidden = true,
                },
                grep_string = {
                    hidden = true,
                },
            },
        })
    end,
    keys = {
        { "<leader>ff", "<cmd>Telescope find_files<CR>", desc = "fuzzy find files in cwd" },
        { "<leader>fr", "<cmd>Telescope oldfiles<CR>", desc = "fuzzy find recent files" },
        { "<leader>fs", "<cmd>Telescope live_grep<CR>", desc = "fuzzy find string in cwd" },
        { "<leader>fc", "<cmd>Telescope grep_string<CR>", desc = "fuzzy find string under the cursor" },
    },
}
