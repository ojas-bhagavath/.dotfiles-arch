local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "//", snippetType = "autosnippet" }, fmta("\\frac{<>}{<>}", { i(1), i(2) }), { condition = in_mathzone }),
    s({ trig = "binom", snippetType = "autosnippet" }, fmta("\\binom{<>}{<>}", { i(1), i(2) }), { condition = in_mathzone }),
    s({ trig = "^", snippetType = "autosnippet" }, fmta("^{<>}", { i(1) }), { condition = in_mathzone }),
    s({ trig = "_", snippetType = "autosnippet" }, fmta("_{<>}", { i(1) }), { condition = in_mathzone }),
    s({ trig = "...", snippetType = "autosnippet" }, t("\\cdots"), { condition = in_mathzone }),
    s({ trig = "emp", snippetType = "autosnippet" }, t("\\varnothing"), { condition = in_mathzone }),
    s({ trig = "aleph", snippetType = "autosnippet" }, t("\\aleph"), { condition = in_mathzone }),
    s({ trig = "nab", snippetType = "autosnippet" }, t("\\nabla"), { condition = in_mathzone }),
    s({ trig = "inft", snippetType = "autosnippet" }, t("\\infty"), { condition = in_mathzone }),
    s({ trig = "deg", snippetType = "autosnippet" }, t("^{\\circ}"), { condition = in_mathzone }),
    s({ trig = "inv", snippetType = "autosnippet" }, t("^{-1}"), { condition = in_mathzone }),
    s({ trig = "ddx", snippetType = "autosnippet" }, fmta("\\frac{d<>}{d<>}", { i(1), i(2) }), { condition = in_mathzone }),
    s({ trig = "pdx", snippetType = "autosnippet" }, fmta("\\frac{\\partial <>}{\\partial <>}", { i(1), i(2) }), { condition = in_mathzone }),
    s({ trig = "part", snippetType = "autosnippet" }, t("\\partial"), { condition = in_mathzone }),
}
