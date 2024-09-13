local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "!", snippetType = "autosnippet" }, t("\\not "), { condition = in_mathzone }),
    s({ trig = "excl", snippetType = "autosnippet" }, t("!"), { condition = in_mathzone }),
    s({ trig = "~~", snippetType = "autosnippet" }, t("\\approx"), { condition = in_mathzone }),
    s({ trig = "mid", snippetType = "autosnippet" }, t("\\mid"), { condition = in_mathzone }),
    s({ trig = "sim", snippetType = "autosnippet" }, t("\\sim"), { condition = in_mathzone }),
    s({ trig = "~-", snippetType = "autosnippet" }, t("\\simeq"), { condition = in_mathzone }),
    s({ trig = "<=", snippetType = "autosnippet" }, t("\\leq"), { condition = in_mathzone }),
    s({ trig = ">=", snippetType = "autosnippet" }, t("\\geq"), { condition = in_mathzone }),
    s(
        { trig = "normal", snippetType = "autosnippet" },
        c(1, {
            t("\\unlhd"),
            t("\\lhd"),
        }),
        { condition = in_mathzone }
    ),
}
