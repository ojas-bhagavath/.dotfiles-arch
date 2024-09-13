local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = ".*", snippetType = "autosnippet" }, t("\\cdot"), { condition = in_mathzone }),
    s({ trig = "circ", snippetType = "autosnippet" }, t("\\circ"), { condition = in_mathzone }),
    s({ trig = "div", snippetType = "autosnippet" }, t("\\div"), { condition = in_mathzone }),
    s({ trig = "-+", snippetType = "autosnippet" }, t("\\mp"), { condition = in_mathzone }),
    s({ trig = "o*", snippetType = "autosnippet" }, t("\\odot"), { condition = in_mathzone }),
    s({ trig = "o+", snippetType = "autosnippet" }, t("\\oplus"), { condition = in_mathzone }),
    s({ trig = "ox", snippetType = "autosnippet" }, t("\\otimes"), { condition = in_mathzone }),
    s({ trig = "+-", snippetType = "autosnippet" }, t("\\pm"), { condition = in_mathzone }),
    s({ trig = "x*", snippetType = "autosnippet" }, t("\\times"), { condition = in_mathzone }),
}
