return {
    "L3MON4D3/LuaSnip",
    lazy = true,
    build = "make install_jsregexp",
    dependencies = {
        {
            "rafamadriz/friendly-snippets",
            config = function()
                require("luasnip.loaders.from_vscode").lazy_load()
            end,
        },
    },
    opts = {
        history = true,
        updateevents = "TextChanged,TextChangedI",
        enable_autosnippets = true,
        delete_check_events = "TextChanged",
    },
    config = function()
        require("luasnip.loaders.from_vscode").lazy_load()
        local ls = require("luasnip")
        local s = ls.snippet
        local sn = ls.snippet_node
        local t = ls.text_node
        local i = ls.insert_node
        local f = ls.function_node
        local c = ls.choice_node
        local d = ls.dynamic_node
        local r = ls.restore_node
        local l = require("luasnip.extras").lambda
        local rep = require("luasnip.extras").rep
        local p = require("luasnip.extras").partial
        local m = require("luasnip.extras").match
        local n = require("luasnip.extras").nonempty
        local dl = require("luasnip.extras").dynamic_lambda
        local fmt = require("luasnip.extras.fmt").fmt
        local fmta = require("luasnip.extras.fmt").fmta
        local types = require("luasnip.util.types")
        local conds = require("luasnip.extras.conditions")
        local conds_expand = require("luasnip.extras.conditions.expand")
        local in_mathzone = function()
            -- The `in_mathzone` function requires the VimTeX plugin
            return vim.fn["vimtex#syntax#in_mathzone"]() == 1
        end

        -- all manual snippets
        ls.add_snippets("all", {
            -- DVG
            s("DVG", {
                t("Davanagere"),
            }),

            -- Address
            s("address", {
                t("3650, 4th main, 9th cross, SS Layout, B Block, Davanagere, Karnataka 577004, India"),
            }),

            s("IISER", {
                t("Indian Institute of Science Education and Research"),
            }),

            -- TVM
            s("TVM", {
                t("Thiruvananthapuram"),
            }),
        })
        -- all autosnippets
        ls.add_snippets("all", {
            s("TVM", {
                t("Thiruvananthapuram"),
            }),
        })

        -- bib manual snippets
        ls.add_snippets("bib", {
            s(
                "book",
                fmt(
                    [[
@book{{{},
    title = {{{}}},
    edition = {{{}}},
    author = {{{}}},
    year = {{{}}},
    publisher = {{{}}},
}}
]],
                    {
                        i(1, ""),
                        i(2, ""),
                        i(3, ""),
                        i(4, ""),
                        i(5, ""),
                        i(6, ""),
                    }
                )
            ),
        })

        -- bib autosnippets ls.add_snippets("bib", {}, { type = "autosnippets" })

        -- tex manual snippets
        ls.add_snippets("tex", {

            s("oc", {
                c(1, {

                    fmt(
                        [[
\begin{{{}}}{{{}}}
    {}
\end{{{}}}
]],
                        {
                            i(1, ""),
                            i(2, ""),
                            i(3, ""),
                            rep(1),
                        }
                    ),
                    fmt(
                        [[
\begin{{{}}}[{}]
    {}
\end{{{}}}
\vspace{{0.3cm}}
{}
]],
                        {
                            i(1, ""),
                            i(2, ""),
                            i(3, ""),
                            rep(1),
                            i(4, ""),
                        }
                    ),
                }),
            }),
        })

        ls.add_snippets("tex", {
            s("nbd", {
                t("neighborhood"),
            }),
            s("Nbd", {
                t("Neighborhood"),
            }),
            s("pou", {
                t("partition of unity"),
            }),
            s("PoU", {
                t("Partition of Unity"),
            }),
            s("//", {
                t("\\frac{"),
                i(1, ""),
                t("}{"),
                i(2, ""),
                t("}"),
            }, { condition = in_mathzone }),
            s({ trig = "_", wordTrig = false }, {
                t("_{"),
                i(1, ""),
                t("}"),
            }, { condition = in_mathzone }),
            s({ trig = "^", wordTrig = false }, {
                t("^{"),
                i(1, ""),
                t("}"),
            }, { condition = in_mathzone }),
            s("wrt", {
                t("with respect to "),
            }),
            s({ trig = "bb(%a)", regTrig = true }, {
                f(function(_, snip)
                    return "\\mathbb{" .. snip.captures[1] .. "}"
                end),
            }, { condition = in_mathzone }),
            s({ trig = "cc(%a)", regTrig = true }, {
                f(function(_, snip)
                    return "\\mathcal{" .. snip.captures[1] .. "}"
                end),
            }, { condition = in_mathzone }),
            s({ trig = "kk(%a)", regTrig = true }, {
                f(function(_, snip)
                    return "\\mathfrak{" .. snip.captures[1] .. "}"
                end),
            }, { condition = in_mathzone }),
            s({ trig = "ss(%a)", regTrig = true }, {
                f(function(_, snip)
                    return "\\mathscr{" .. snip.captures[1] .. "}"
                end),
            }, { condition = in_mathzone }),
            s({ trig = "hh(%a)", regTrig = true }, {
                f(function(_, snip)
                    return "\\hat{" .. snip.captures[1] .. "}"
                end),
            }, { condition = in_mathzone }),
            s("bigp", {
                c(1, {
                    fmt("\\left\\{{ {} \\right\\}}", {
                        i(1, ""),
                    }),
                    fmt("\\left( {} \\right)", {
                        i(1, ""),
                    }),
                    fmt("\\left| {} \\right|", {
                        i(1, ""),
                    }),
                    fmt("\\left\\| {} \\right\\|", {
                        i(1, ""),
                    }),
                    fmt("\\left[ {} \\right]", {
                        i(1, ""),
                    }),
                    fmt("\\left\\langle {} \\right\\rangle", {
                        i(1, ""),
                    }),
                }),
            }, { condition = in_mathzone }),
        })
    end,
}
