return {
    "stevearc/oil.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    cmd = "Oil",
    keys = {
        {"<leader>o", "<cmd>Oil<CR>", desc = "Open Oil"}
    },
    config = function()
        require("oil").setup({
            default_file_explorer = true,
            columns = {
                "icon",
            },
            delete_to_trash = true,
            view_options = {
                show_hidden = true,
            }
        })
    end
}

