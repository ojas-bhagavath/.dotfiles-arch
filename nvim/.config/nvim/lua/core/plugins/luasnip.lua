return {
    "L3MON4D3/LuaSnip",
    build = (not jit.os:find("Windows")) and "echo 'NOTE: jsregexp is optional, so not a big deal if it fails to build'; make install_jsregexp" or nil,
    dependencies = {
        "rafamadriz/friendly-snippets",
        config = function()
            require("luasnip.loaders.from_lua").load({
                paths = "~/.config/nvim/lua/core/snippets/",
            })
        end,
    },
    keys = {},
    config = function()
        require("luasnip").setup({
            history = true,
            updateevents = "TextChanged,TextChangedI",
            enable_autosnippets = true,
            delete_check_events = "TextChanged",
        })
    end,
}
