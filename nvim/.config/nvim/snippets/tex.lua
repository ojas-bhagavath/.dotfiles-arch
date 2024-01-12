local ls = require("luasnip") --{{{
local s = ls.s
local i = ls.i
local t = ls.t
local d = ls.dynamic_node
local c = ls.choice_node
local f = ls.function_node
local sn = ls.snippet_node
local fmt = require("luasnip.extras.fmt").fmt
local rep = require("luasnip.extras").rep
local snippets, autosnippets = {}, {} --}}}
local group = vim.api.nvim_create_augroup("Lua Snippets", { clear = true })
local file_pattern = "*.tex"
local in_mathzone = function()
  -- The `in_mathzone` function requires the VimTeX plugin
  return vim.fn["vimtex#syntax#in_mathzone"]() == 1
end
-- Snippets go here!

local beginend = s("oc", {
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
})
table.insert(snippets, beginend)

local frac = s("//", {
  t("\\frac{"),
  i(1, ""),
  t("}{"),
  i(2, ""),
  t("}"),
}, { condition = in_mathzone })
table.insert(autosnippets, frac)

local sub = s({ trig = "_", wordTrig = false }, {
  t("_{"),
  i(1, ""),
  t("}"),
}, { condition = in_mathzone })
table.insert(autosnippets, sub)

local sup = s({ trig = "^", wordTrig = false }, {
  t("^{"),
  i(1, ""),
  t("}"),
}, { condition = in_mathzone })
table.insert(autosnippets, sup)

local wrt = s("wrt", {
  t("with respect to"),
})
table.insert(autosnippets, wrt)

local mathbb = s({ trig = "bb(%a)", regTrig = true }, {
  f(function(_, snip)
    return "\\mathbb{" .. snip.captures[1] .. "}"
  end),
}, { condition = in_mathzone })
table.insert(autosnippets, mathbb)

local mathcal = s({ trig = "cc(%a)", regTrig = true }, {
  f(function(_, snip)
    return "\\mathcal{" .. snip.captures[1] .. "}"
  end),
}, { condition = in_mathzone })
table.insert(autosnippets, mathcal)

local mathfrak = s({ trig = "kk(%a)", regTrig = true }, {
  f(function(_, snip)
    return "\\mathfrak{" .. snip.captures[1] .. "}"
  end),
}, { condition = in_mathzone })
table.insert(autosnippets, mathfrak)

-- Snippets go here!
return snippets, autosnippets
