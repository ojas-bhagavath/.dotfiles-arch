return {
    {
        "iamcco/markdown-preview.nvim",
        cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
        ft = { "markdown" },
        build = "npm install",
        keys = {
            {
                "<leader>om",
                ft = "markdown",
                "<cmd>MarkdownPreviewToggle<cr>",
                desc = "Markdown Preview",
            },
        },
    },
    {
        "OXY2DEV/markview.nvim",
        ft = { "markdown" },
        dependencies = {
            "nvim-treesitter/nvim-treesitter",
            "nvim-tree/nvim-web-devicons",
        },
        keys = {
            {
                "<leader>oM",
                ft = "markdown",
                "<cmd>Markview toggle<cr>",
                desc = "Markview Toggle",
            },
        },
    },
}
