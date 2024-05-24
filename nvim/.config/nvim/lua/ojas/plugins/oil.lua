return {
    "stevearc/oil.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    cmd = "Oil",
    opts = {
        default_file_explorer = true,
        columns = {
            "icon",
        },
        delete_to_trash = true,
        view_options = {
            show_hidden = true,
        },
    },
    keys = {
        { "<leader>o", "<cmd>Oil<CR>", desc = "Open Oil" },
    },
}
