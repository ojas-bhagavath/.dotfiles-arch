local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "neg", snippetType = "autosnippet" }, t("\\neg"), { condition = in_mathzone }),
    s({ trig = "orr", snippetType = "autosnippet" }, t("\\lor"), { condition = in_mathzone }),
    s({ trig = "andd", snippetType = "autosnippet" }, t("\\land"), { condition = in_mathzone }),
    s({ trig = "forall", snippetType = "autosnippet" }, t("\\forall"), { condition = in_mathzone }),
    s({ trig = "is", snippetType = "autosnippet" }, t("\\exists"), { condition = in_mathzone }),
    s({ trig = ":.", snippetType = "autosnippet" }, t("\\because"), { condition = in_mathzone }),
    s({ trig = ".:", snippetType = "autosnippet" }, t("\\therefore"), { condition = in_mathzone }),
}
