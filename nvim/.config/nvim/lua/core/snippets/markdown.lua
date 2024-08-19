return {
    s("oc", {
        t("\\begin{"),
        i(1, ""),
        t("}["),
        i(2, ""),
        t({ "]", "" }),
        t("    "),
        i(3, ""),
        t({ "", "" }),
        t("\\end{"),
        rep(1),
        t({ "}", "" }),
    }),

    s("\\ ", {
        t({ "\\", "" }),
    }),

    s("//", {
        t("\\frac{"),
        i(1, ""),
        t("}{"),
        i(2, ""),
        t("}"),
    }),

    s({ trig = "_", wordTrig = false }, {
        t("_{"),
        i(1, ""),
        t("}"),
    }),

    s({ trig = "^", wordTrig = false }, {
        t("^{"),
        i(1, ""),
        t("}"),
    }),

    s("wrt", {
        t("with respect to"),
    }),

    s({ trig = "bb(%a)", regTrig = true }, {
        f(function(_, snip)
            return "\\mathbb{" .. snip.captures[1] .. "}"
        end),
    }),

    s({ trig = "cc(%a)", regTrig = true }, {
        f(function(_, snip)
            return "\\mathcal{" .. snip.captures[1] .. "}"
        end),
    }),

    s({ trig = "kk(%a)", regTrig = true }, {
        f(function(_, snip)
            return "\\mathfrak{" .. snip.captures[1] .. "}"
        end),
    }),

    s({ trig = "ss(%a)", regTrig = true }, {
        f(function(_, snip)
            return "\\mathscr{" .. snip.captures[1] .. "}"
        end),
    }),

    s({ trig = "hh(%a)", regTrig = true }, {
        f(function(_, snip)
            return "\\hat{" .. snip.captures[1] .. "}"
        end),
    }),

    s("bigp", {
        c(1, {
            fmt("\\left\\{{ {} \\right\\}}", {
                i(1, ""),
            }),
            fmt("\\left( {} \\right)", {
                i(1, ""),
            }),
            fmt("\\left| {} \\right|", {
                i(1, ""),
            }),
            fmt("\\left\\| {} \\right\\|", {
                i(1, ""),
            }),
            fmt("\\left[ {} \\right]", {
                i(1, ""),
            }),
            fmt("\\left\\langle {} \\right\\rangle", {
                i(1, ""),
            }),
        }),
    }),
}
