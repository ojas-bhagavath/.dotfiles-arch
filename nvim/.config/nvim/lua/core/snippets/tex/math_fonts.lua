local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "bb(%a)", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\mathbb{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "cc(%a)", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\mathcal{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "kk(%a)", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\mathfrak{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),

    s({ trig = "ss(%a)", regTrig = true, snippetType = "autosnippet" }, {
        f(function(_, snip)
            return "\\mathscr{" .. snip.captures[1] .. "}"
        end),
    }, { condition = in_mathzone }),
}
