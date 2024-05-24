return {
    "windwp/nvim-autopairs",
    event = "InsertEnter",
    opts = {},
    dependencies = { "hrsh7th/nvim-cmp" },
    config = function()
        local cmp_autopairs = require "nvim-autopairs.completion.cmp"
        local cmp = require "cmp"
        cmp.event:on("confirm_done", cmp_autopairs.on_confirm_done())

        local rule = require "nvim-autopairs.rule"
        local npairs = require "nvim-autopairs"
        npairs.add_rules {
            rule("$", "$", { "tex", "latex" }),
        }
    end,
}
