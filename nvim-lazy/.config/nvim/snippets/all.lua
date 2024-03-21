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

-- The Snippets!

local DVG = s("DVG", {
    t("Davanagere"),
})
table.insert(snippets, DVG)

local TVM = s("TVM", {
    t("Thiruvananthapuram"),
})
table.insert(snippets, TVM)

local IISER = s("IISER", {
    t("Indian Institute of Science Education and Research"),
})
table.insert(snippets, IISER)

local address = s("address", {
    t("3650, 4th main, 9th cross, SS Layout, B Block, Davanagere, Karnataka 577004, India"),
})
table.insert(snippets, address)

return snippets, autosnippets
