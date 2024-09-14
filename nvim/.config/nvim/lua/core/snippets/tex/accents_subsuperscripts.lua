local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "(%S+)bar", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\overline{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "(%a)dot", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\dot{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "(%a)ddot", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\ddot{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "(%S+)tild", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\widetilde{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "(%S+)hat", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\widehat{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "(%S+)vec", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\overrightarrow{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "(%S+)und", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\underline{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "^", wordTrig = false, snippetType = "autosnippet" }, fmta("^{<>}", { i(1) }), { condition = in_mathzone }),
    s({ trig = "_", wordTrig = false, snippetType = "autosnippet" }, fmta("_{<>}", { i(1) }), { condition = in_mathzone }),
    s({ trig = "'", wordTrig = false, snippetType = "autosnippet" }, t("^{\\prime}"), { condition = in_mathzone }),
    s({ trig = "deg", wordTrig = false, snippetType = "autosnippet" }, t("^{\\circ}"), { condition = in_mathzone }),
    s({ trig = "inv", wordTrig = false, snippetType = "autosnippet" }, t("^{-1}"), { condition = in_mathzone }),
}
