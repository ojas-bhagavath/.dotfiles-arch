return {
    "Shatur/neovim-session-manager",
    event = "VeryLazy",
    keys = {
        { "<leader>qs", "<cmd>SessionManager load_session<CR>", desc = "Load Session" },
        { "<leader>ql", "<cmd>SessionManager load_last_session<CR>", desc = "Load Last Session" },
        { "<leader>qd", "<cmd>SessionManager delete_session<CR>", desc = "Delete Session" },
    },
}
