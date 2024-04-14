-- bootstrap lazy.nvim, LazyVim and your plugins
require("config.lazy")

if vim.g.neovide then
    vim.o.guifont = "Hack Nerd Font:h16"
    vim.o.linespace = 1
    vim.g.neovide_font_hinting = 'none'
    vim.g.neovide_font_edging = 'subpixelantialias'
end
