local ls = require("luasnip") --{{{
local s = ls.s
local i = ls.i
local t = ls.t
local d = ls.dynamic_node
local c = ls.choice_node
local f = ls.function_node
local sn = ls.snippet_node
local fmt = require("luasnip.extras.fmt").fmt
local rep = require("luasnip.extras").rep
local snippets, autosnippets = {}, {} --}}}
local group = vim.api.nvim_create_augroup("Lua Snippets", { clear = true })
local file_pattern = "*.tex"
local in_mathzone = function()
    -- The `in_mathzone` function requires the VimTeX plugin
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end
-- Snippets go here!
--
local pou = s("pou", {
    c(1, {
        fmt("partition of unity {}", {
            i(1, ""),
        }),
        fmt("Partition of Unity {}", {
            i(1, ""),
        }),
    }),
})
table.insert(autosnippets, pou)

local openclose = s("oc", {
    c(1, {

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
        fmt(
            [[
\begin{{{}}}[{}]
    {}
\end{{{}}}
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
})
table.insert(snippets, openclose)

local frac = s("//", {
    t("\\frac{"),
    i(1, ""),
    t("}{"),
    i(2, ""),
    t("}"),
}, { condition = in_mathzone })
table.insert(autosnippets, frac)

local sub = s({ trig = "_", wordTrig = false }, {
    t("_{"),
    i(1, ""),
    t("}"),
}, { condition = in_mathzone })
table.insert(autosnippets, sub)

local sup = s({ trig = "^", wordTrig = false }, {
    t("^{"),
    i(1, ""),
    t("}"),
}, { condition = in_mathzone })
table.insert(autosnippets, sup)

local wrt = s("wrt", {
    t("with respect to "),
})
table.insert(autosnippets, wrt)

local mathbb = s({ trig = "bb(%a)", regTrig = true }, {
    f(function(_, snip)
        return "\\mathbb{" .. snip.captures[1] .. "}"
    end),
}, { condition = in_mathzone })
table.insert(autosnippets, mathbb)

local mathcal = s({ trig = "cc(%a)", regTrig = true }, {
    f(function(_, snip)
        return "\\mathcal{" .. snip.captures[1] .. "}"
    end),
}, { condition = in_mathzone })
table.insert(autosnippets, mathcal)

local mathfrak = s({ trig = "kk(%a)", regTrig = true }, {
    f(function(_, snip)
        return "\\mathfrak{" .. snip.captures[1] .. "}"
    end),
}, { condition = in_mathzone })
table.insert(autosnippets, mathfrak)

local mathscr = s({ trig = "ss(%a)", regTrig = true }, {
    f(function(_, snip)
        return "\\mathscr{" .. snip.captures[1] .. "}"
    end),
}, { condition = in_mathzone })
table.insert(autosnippets, mathscr)

local hat = s({ trig = "hh(%a)", regTrig = true }, {
    f(function(_, snip)
        return "\\hat{" .. snip.captures[1] .. "}"
    end),
}, { condition = in_mathzone })
table.insert(autosnippets, hat)

local bigp = s("bigp", {
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
}, { condition = in_mathzone })
table.insert(autosnippets, bigp)

-- Snippets go here!
return snippets, autosnippets
