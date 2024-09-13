return {
    "lewis6991/gitsigns.nvim",
    event = { "BufReadPost", "BufWritePost", "BufNewFile" },
    opts = {
        signs = {
            add = { text = "▎" },
            change = { text = "▎" },
            delete = { text = "" },
            topdelete = { text = "" },
            changedelete = { text = "▎" },
            untracked = { text = "▎" },
        },
        on_attach = function(buffer)
            local gs = package.loaded.gitsigns

            local function map(mode, l, r, desc)
                vim.keymap.set(mode, l, r, { buffer = buffer, desc = desc })
            end

            map("n", "]h", function()
                gs.nav_hunk("next")
            end, "Next Hunk")
            map("n", "[h", function()
                gs.nav_hunk("prev")
            end, "Prev Hunk")
            map("n", "]H", function()
                gs.nav_hunk("last")
            end, "Last Hunk")
            map("n", "[H", function()
                gs.nav_hunk("first")
            end, "First Hunk")
        end,
    },
}
