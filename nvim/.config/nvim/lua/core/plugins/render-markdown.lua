return {
    "MeanderingProgrammer/render-markdown.nvim",
    ft = { "markdown", "norg", "rmd", "org" },
    enabled = false,
    dependencies = { "nvim-treesitter/nvim-treesitter", "nvim-tree/nvim-web-devicons" },
    opts = {
        file_types = { "markdown", "norg", "rmd", "org" },
        code = {
            sign = false,
            width = "block",
            right_pad = 1,
        },
        heading = {
            sign = false,
            icons = {},
        },
    },
    config = function()
        vim.cmd([[RenderMarkdown]])
    end,
}
