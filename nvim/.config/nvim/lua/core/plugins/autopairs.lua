return {
    "windwp/nvim-autopairs",
    event = "InsertEnter",
    dependencies = { "hrsh7th/nvim-cmp" },
    config = function()
        require("nvim-autopairs").setup()
        local npairs = require("nvim-autopairs")
        local rule = require("nvim-autopairs.rule")
        npairs.add_rules({
            rule("$", "$", { "tex", "latex", "markdown" }),
        })
    end,
}
