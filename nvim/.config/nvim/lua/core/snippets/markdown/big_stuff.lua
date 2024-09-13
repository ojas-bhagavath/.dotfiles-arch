local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "lrr", snippetType = "autosnippet" }, fmta("\\left(<>\\right)", { i(1) }), { condition = in_mathzone }),
    s({ trig = "lrs", snippetType = "autosnippet" }, fmta("\\left[<>\\right]", { i(1) }), { condition = in_mathzone }),
    s({ trig = "lrc", snippetType = "autosnippet" }, fmta("\\left\\{<>\\right\\}", { i(1) }), { condition = in_mathzone }),
    s({ trig = "lrm", snippetType = "autosnippet" }, fmta("\\left|<>\\right|", { i(1) }), { condition = in_mathzone }),
    s({ trig = "lrn", snippetType = "autosnippet" }, fmta("\\left\\|<>\\right\\|", { i(1) }), { condition = in_mathzone }),
    s({ trig = "lra", snippetType = "autosnippet" }, fmta("\\left\\langle <> \\right\\rangle", { i(1) }), { condition = in_mathzone }),

    s(
        { trig = "sum", snippetType = "autosnippet" },
        c(1, {
            fmta("\\sum_{<>}^{<>}{<>}", { i(1), i(2), i(3) }),
            fmta("\\sum{<>}", i(1)),
        }),
        { condition = in_mathzone }
    ),
    s(
        { trig = "prod", snippetType = "autosnippet" },
        c(1, {
            fmta("\\prod_{<>}^{<>}{<>}", { i(1), i(2), i(3) }),
            fmta("\\prod{<>}", i(1)),
        }),
        { condition = in_mathzone }
    ),
    s(
        { trig = "int", snippetType = "autosnippet" },
        c(1, {
            fmta("\\int\\limits_{<>}^{<>}{<>}\\,d<>", { i(1), i(2), i(3), i(4) }),
            fmta("\\int{<>}\\,d<>", { i(1), i(2) }),
        }),
        { condition = in_mathzone }
    ),

    s(
        { trig = "bcup", snippetType = "autosnippet" },
        c(1, {
            fmta("\\bigcup_{<>}^{<>}{<>}", { i(1), i(2), i(3) }),
            fmta("\\bigcup_{<>}", i(1)),
        }),
        { condition = in_mathzone }
    ),
    s(
        { trig = "bscup", snippetType = "autosnippet" },
        c(1, {
            fmta("\\bigsqcup_{<>}^{<>}{<>}", { i(1), i(2), i(3) }),
            fmta("\\bigsqcup_{<>}", i(1)),
        }),
        { condition = in_mathzone }
    ),
    s(
        { trig = "bcap", snippetType = "autosnippet" },
        c(1, {
            fmta("\\bigcap_{<>}^{<>}{<>}", { i(1), i(2), i(3) }),
            fmta("\\bigcap{<>}", i(1)),
        }),
        { condition = in_mathzone }
    ),
    s(
        { trig = "lim", snippetType = "autosnippet" },
        c(1, {
            fmta("\\lim\\limits_{<> \\to <>}{<>}", { i(1), i(2), i(3) }),
            fmta("\\lim{<>}", i(1)),
        }),
        { condition = in_mathzone }
    ),
}
