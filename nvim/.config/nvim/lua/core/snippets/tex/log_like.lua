local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "Im", snippetType = "autosnippet" }, t("\\Im"), { condition = in_mathzone }),
    s({ trig = "Re", snippetType = "autosnippet" }, t("\\Re"), { condition = in_mathzone }),
    s({ trig = "acos", snippetType = "autosnippet" }, t("\\arccos"), { condition = in_mathzone }),
    s({ trig = "arg", snippetType = "autosnippet" }, t("\\arg"), { condition = in_mathzone }),
    s({ trig = "asin", snippetType = "autosnippet" }, t("\\arcsin"), { condition = in_mathzone }),
    s({ trig = "atan", snippetType = "autosnippet" }, t("\\arcsin"), { condition = in_mathzone }),
    s({ trig = "cos", snippetType = "autosnippet" }, t("\\cos"), { condition = in_mathzone }),
    s({ trig = "cot", snippetType = "autosnippet" }, t("\\cot"), { condition = in_mathzone }),
    s({ trig = "csc", snippetType = "autosnippet" }, t("\\csc"), { condition = in_mathzone }),
    s({ trig = "det", snippetType = "autosnippet" }, t("\\det"), { condition = in_mathzone }),
    s({ trig = "dim", snippetType = "autosnippet" }, t("\\dim"), { condition = in_mathzone }),
    s({ trig = "exp", snippetType = "autosnippet" }, t("\\exp"), { condition = in_mathzone }),
    s({ trig = "gcd", snippetType = "autosnippet" }, t("\\gcd"), { condition = in_mathzone }),
    s({ trig = "infi", snippetType = "autosnippet" }, t("\\inf"), { condition = in_mathzone }),
    s({ trig = "ker", snippetType = "autosnippet" }, t("\\ker"), { condition = in_mathzone }),
    s({ trig = "linf", snippetType = "autosnippet" }, t("\\liminf"), { condition = in_mathzone }),
    s({ trig = "ln", snippetType = "autosnippet" }, t("\\ln"), { condition = in_mathzone }),
    s({ trig = "log", snippetType = "autosnippet" }, t("\\log"), { condition = in_mathzone }),
    s({ trig = "lsup", snippetType = "autosnippet" }, t("\\limsup"), { condition = in_mathzone }),
    s({ trig = "max", snippetType = "autosnippet" }, t("\\max"), { condition = in_mathzone }),
    s({ trig = "min", snippetType = "autosnippet" }, t("\\min"), { condition = in_mathzone }),
    s({ trig = "sec", snippetType = "autosnippet" }, t("\\sec"), { condition = in_mathzone }),
    s({ trig = "sin", snippetType = "autosnippet" }, t("\\sin"), { condition = in_mathzone }),
    s({ trig = "sup", snippetType = "autosnippet" }, t("\\sup"), { condition = in_mathzone }),
    s({ trig = "tan", snippetType = "autosnippet" }, t("\\tan"), { condition = in_mathzone }),
}
