-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here
local ls = require("luasnip")
vim.keymap.set({ "i", "v", "x" }, "jk", "<ESC>", { silent = true, nowait = true })
vim.keymap.set({ "i", "v", "x" }, "kj", "<ESC>", { silent = true, nowait = true })
vim.keymap.set("x", "<S-j>", ":move '>+1<CR>gv-gv", { silent = true, desc = "Move the line down" })
vim.keymap.set("x", "<S-k>", ":move '<-2<CR>gv-gv", { silent = true, desc = "Move the line up" })

vim.keymap.set({ "i" }, "<c-j>", function()
  ls.expand()
end, { silent = true })
vim.keymap.set({ "i", "s" }, "<c-l>", function()
  ls.jump(1)
end, { silent = true })
vim.keymap.set({ "i", "s" }, "<c-h>", function()
  ls.jump(-1)
end, { silent = true })

vim.keymap.set({ "i", "s" }, "<c-e>", function()
  if ls.choice_active() then
    ls.change_choice(1)
  end
end, { silent = true })
vim.keymap.set("n", "<leader>rs", "<cmd>source ~/.config/nvim/lua/plugins/luasnip.lua<CR>")
