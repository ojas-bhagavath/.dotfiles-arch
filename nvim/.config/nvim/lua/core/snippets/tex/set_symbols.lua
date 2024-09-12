local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "\\\\\\", snippetType = "autosnippet" }, t("\\setminus"), { condition = in_mathzone }),
    s({ trig = "cap", snippetType = "autosnippet" }, t("\\cap"), { condition = in_mathzone }),
    s({ trig = "cup", snippetType = "autosnippet" }, t("\\cup"), { condition = in_mathzone }),
    s({ trig = "scup", snippetType = "autosnippet" }, t("\\sqcup"), { condition = in_mathzone }),
    s({ trig = "scap", snippetType = "autosnippet" }, t("\\sqcap"), { condition = in_mathzone }),
    s({ trig = "inn", snippetType = "autosnippet" }, t("\\in"), { condition = in_mathzone }),

    s(
        { trig = "sub", snippetType = "autosnippet" },
        c(1, {
            t("\\subseteq"),
            t("\\subsetneq"),
            t("\\subset"),
        }),
        { condition = in_mathzone }
    ),
    s(
        { trig = "bus", snippetType = "autosnippet" },
        c(1, {
            t("\\supseteq"),
            t("\\supsetneq"),
            t("\\supset"),
        }),
        { condition = in_mathzone }
    ),
}
