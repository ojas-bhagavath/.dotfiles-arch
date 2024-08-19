return {
    "epwalsh/obsidian.nvim",
    version = "*", -- recommended, use latest release instead of latest commit
    lazy = true,
    -- Replace the above line with this if you only want to load obsidian.nvim for markdown files in your vault:
    event = {
        "BufReadPre " .. vim.fn.expand("~") .. "Stuff/Vaults/StoaPoikile/*.md",
        "BufNewFile " .. vim.fn.expand("~") .. "Stuff/Vaults/StoaPoikile/*.md",
        "BufReadPre " .. vim.fn.expand("~") .. "Stuff/Vaults/Lyceum/*.md",
        "BufNewFile " .. vim.fn.expand("~") .. "Stuff/Vaults/Lyceum/*.md",
    },
    dependencies = {
        "nvim-lua/plenary.nvim",
    },
    opts = {
        workspaces = {
            {
                name = "StoaPoikile",
                path = "~/Stuff/Vaults/StoaPoikile/",
            },
            {
                name = "Lyceum",
                path = "~/Stuff/Vaults/Lyceum/",
            },
        },
    },
}
