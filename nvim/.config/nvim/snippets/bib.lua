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
local file_pattern = "*.bib"

-- Snippets go here!

local book = s(
  "book",
  fmt(
    [[
@book{{{},
    title = {{{}}},
    edition = {{{}}},
    author = {{{}}},
    year = {{{}}},
    publisher = {{{}}},
}}
]],
    {
      i(1, ""),
      i(2, ""),
      i(3, ""),
      i(4, ""),
      i(5, ""),
      i(6, ""),
    }
  )
)
table.insert(autosnippets, book)

-- Snippets go here!
return snippets, autosnippets
