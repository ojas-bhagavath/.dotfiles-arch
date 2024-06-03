return {
    "romgrk/barbar.nvim",
    event = { "BufReadPost", "BufWritePost", "BufNewFile" },
    dependencies = {
        "lewis6991/gitsigns.nvim",
        "nvim-tree/nvim-web-devicons",
    },
    init = function()
        vim.g.barbar_auto_setup = false
    end,
    opts = {
        animation = true,
        insert_at_end = true,
        auto_hide = 1,
    },
}
