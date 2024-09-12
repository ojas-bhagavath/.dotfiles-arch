return {
    "L3MON4D3/LuaSnip",
    version = "v2.*",
    build = "make install_jsregexp",
    lazy = true,
    config = function()
        -- Local variables
        local ls = require("luasnip")
        local s = ls.snippet
        local sn = ls.snippet_node
        local isn = ls.indent_snippet_node
        local t = ls.text_node
        local i = ls.insert_node
        local f = ls.function_node
        local c = ls.choice_node
        local d = ls.dynamic_node
        local r = ls.restore_node
        local events = require("luasnip.util.events")
        local ai = require("luasnip.nodes.absolute_indexer")
        local extras = require("luasnip.extras")
        local l = extras.lambda
        local rep = extras.rep
        local p = extras.partial
        local m = extras.match
        local n = extras.nonempty
        local dl = extras.dynamic_lambda
        local fmt = require("luasnip.extras.fmt").fmt
        local fmta = require("luasnip.extras.fmt").fmta
        local conds = require("luasnip.extras.expand_conditions")
        local postfix = require("luasnip.extras.postfix").postfix
        local types = require("luasnip.util.types")
        local parse = require("luasnip.util.parser").parse_snippet
        local ms = ls.multi_snippet
        local k = require("luasnip.nodes.key_indexer").new_key

        -- Options
        ls.setup({
            history = true,
            updateevents = "TextChanged,TextChangedI",
            enable_autosnippets = true,
        })

        -- Lua snippets path
        require("luasnip.loaders.from_lua").load({ paths = "~/.config/nvim/lua/core/snippets/" })

        -- Keybinds
        vim.keymap.set({ "i", "s" }, "<C-l>", function()
            if ls.expand_or_locally_jumpable() then
                ls.expand_or_jump()
            end
        end, { silent = true })
        vim.keymap.set({ "i", "s" }, "<C-h>", function()
            if ls.locally_jumpable(-1) then
                ls.jump(-1)
            end
        end, { silent = true })
        vim.keymap.set({ "i", "s" }, "<C-o>", function()
            if ls.choice_active() then
                ls.change_choice(1)
            end
        end, { silent = true })
    end,
    vim.keymap.set(
        "n",
        "<leader>rs",
        '<cmd>lua require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/lua/core/snippets/"})<CR>',
        { desc = "Reload Snippets" }
    ),
}
