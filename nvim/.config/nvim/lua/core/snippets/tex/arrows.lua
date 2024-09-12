local in_mathzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end

return {
    s({ trig = "->", snippetType = "autosnippet" }, t("\\leftarrow"), { condition = in_mathzone }),
    s({ trig = "-<", snippetType = "autosnippet" }, t("\\rightarrow"), { condition = in_mathzone }),
    s({ trig = "mapsto", snippetType = "autosnippet" }, t("\\mapsto"), { condition = in_mathzone }),
    s({ trig = "inclusion", snippetType = "autosnippet" }, t("\\hookrightarrow"), { condition = in_mathzone }),
    s({ trig = "=>", snippetType = "autosnippet" }, t("\\implies"), { condition = in_mathzone }),
    s({ trig = "=<", snippetType = "autosnippet" }, t("\\impliedby"), { condition = in_mathzone }),
    s({ trig = "iff", snippetType = "autosnippet" }, t("\\iff"), { condition = in_mathzone }),
}
