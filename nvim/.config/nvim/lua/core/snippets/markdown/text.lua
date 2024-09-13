local in_textzone = function()
    return vim.fn["vimtex#syntax#in_mathzone"]() == 0
end

return {
    s({ trig = "wrt", snippetType = "autosnippet" }, t("with respect to"), { condition = in_textzone }),
    s({ trig = "tfae", snippetType = "autosnippet" }, t("the following are equivalent:"), { condition = in_textzone }),
}
