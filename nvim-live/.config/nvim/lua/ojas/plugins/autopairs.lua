return {
    "windwp/nvim-autopairs",
    event = "InsertEnter",
    config = function()
        require("nvim-autopairs").setup({})
        local rule = require("nvim-autopairs.rule")
        local npairs = require("nvim-autopairs")

        npairs.add_rules({
            rule("$", "$", { "tex", "latex" }),
        })
    end,
}
