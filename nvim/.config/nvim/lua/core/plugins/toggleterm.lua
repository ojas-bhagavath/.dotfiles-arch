return {
    "akinsho/toggleterm.nvim",
    version = "*",
    config = function()
        require("toggleterm").setup({
            size = function(term)
                if term.direction == "horizontal" then
                    return 15
                elseif term.direction == "vertical" then
                    return vim.o.columns * 0.4
                end
            end,
            open_mapping = [[<c-\>]],
        })
    end,
    keys = {
        {
            "<leader>tt",
            mode = { "n" },
            "<cmd>ToggleTerm direction=horizontal<cr>",
            desc = "Toggleterm Bottom",
        },
        {
            "<leader>ts",
            mode = { "n" },
            "<cmd>ToggleTerm direction=vertical<cr>",
            desc = "Toggleterm Right",
        },
    },
}
