# .dotfiles-arch/nvim/.config/nvim

<a href="https://dotfyle.com/ojas-bhagavath/dotfiles-arch-nvim-config-nvim"><img src="https://dotfyle.com/ojas-bhagavath/dotfiles-arch-nvim-config-nvim/badges/leaderkey?style=flat" /></a>
<a href="https://dotfyle.com/ojas-bhagavath/dotfiles-arch-nvim-config-nvim"><img src="https://dotfyle.com/ojas-bhagavath/dotfiles-arch-nvim-config-nvim/badges/plugin-manager?style=flat" /></a>

## Install Instructions

> Install requires Neovim 0.9+. Always review the code before installing a configuration.

Clone the repository and install the plugins:

```sh
git clone git@github.com:ojas-bhagavath/.dotfiles-arch ~/.config/ojas-bhagavath/.dotfiles-arch
NVIM_APPNAME=ojas-bhagavath/.dotfiles-arch/nvim/.config/nvim nvim --headless +"Lazy! sync" +qa
```

Open Neovim with this config:

```sh
NVIM_APPNAME=ojas-bhagavath/.dotfiles-arch/nvim/.config/nvim nvim
```

## Plugins

### plugin-manager

- [folke/lazy.nvim](https://github.com/folke/lazy.nvim)

### code

- [hrsh7th/nvim-cmp](https://github.com/hrsh7th/nvim-cmp)
  - [hrsh7th/cmp-buffer](https://github.com/hrsh7th/cmp-buffer),
  - [hrsh7th/cmp-path](https://github.com/hrsh7th/cmp-path),
  - [hrsh7th/cmp-nvim-lsp](https://github.com/hrsh7th/cmp-nvim-lsp),
  - [saadparwaiz1/cmp_luasnip](https://github.com/saadparwaiz1/cmp_luasnip),
- [L3MON4D3/LuaSnip](https://github.com/L3MON4D3/LuaSnip)
- [windwp/nvim-autopairs](https://github.com/windwp/nvim-autopairs)

### colorscheme

- [folke/tokyonight.nvim](https://github.com/folke/tokyonight.nvim)

### editor

- [mikavilpas/yazi.nvim](https://github.com/mikavilpas/yazi.nvim)
- [folke/flash.nvim](https://github.com/folke/flash.nvim)
- [folke/which-key.nvim](https://github.com/folke/which-key.nvim)
- [lewis6991/gitsigns.nvim](https://github.com/lewis6991/gitsigns.nvim)
- [echasnovski/mini.move](https://github.com/echasnovski/mini.move)

### formatting

- [stevearc/conform.nvim](https://github.com/stevearc/conform.nvim)

### linting

- [mfussenegger/nvim-lint](https://github.com/mfussenegger/nvim-lint)

### lsp

- [neovim/nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)
- [williamboman/mason.nvim](https://github.com/williamboman/mason.nvim)
- [williamboman/mason-lspconfig.nvim](https://github.com/williamboman/mason-lspconfig.nvim)
- [WhoIsSethDaniel/mason-tool-installer.nvim](https://github.com/WhoIsSethDaniel/mason-tool-installer.nvim)

### treesitter

- [nvim-treesitter/nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)
- [windwp/nvim-ts-autotag](https://github.com/windwp/nvim-ts-autotag)

### ui

- [rcarriga/nvim-notify](https://github.com/rcarriga/nvim-notify)
- [nvim-lualine/lualine.nvim](https://github.com/nvim-lualine/lualine.nvim)
- [lukas-reineke/indent-blankline.nvim](https://github.com/lukas-reineke/indent-blankline.nvim)
- [echasnovski/mini.indentscope](https://github.com/echasnovski/mini.indentscope)
- [folke/noice.nvim](https://github.com/folke/noice.nvim)
- [nvim-tree/nvim-web-devicons](https://github.com/nvim-tree/nvim-web-devicons)
- [NvChad/nvim-colorizer.lua](https://github.com/NvChad/nvim-colorizer.lua)
- [nvimdev/dashboard-nvim](https://github.com/nvimdev/dashboard-nvim)
- [MunifTanjim/nui.nvim](https://github.com/MunifTanjim/nui.nvim)
- [j-hui/fidget.nvim](https://github.com/j-hui/fidget.nvim)
- [akinsho/toggleterm.nvim](https://github.com/akinsho/toggleterm.nvim)
- [stevearc/dressing.nvim](https://github.com/stevearc/dressing.nvim)

### util

- [Shatur/neovim-session-manager](https://github.com/Shatur/neovim-session-manager)
- [nvim-lua/plenary.nvim](https://github.com/nvim-lua/plenary.nvim)
- [nvim-telescope/telescope.nvim](https://github.com/nvim-telescope/telescope.nvim)
- [nvim-telescope/telescope-fzf-native.nvim](https://github.com/nvim-telescope/telescope-fzf-native.nvim)
- [kdheepak/lazygit.nvim](https://github.com/kdheepak/lazygit.nvim)
- [jiaoshijie/undotree](https://github.com/jiaoshijie/undotree)
- [echasnovski/mini.bracketed](https://github.com/echasnovski/mini.bracketed)
- [echasnovski/mini.bufremove](https://github.com/echasnovski/mini.bufremove)

### language-specific

#### markdown

- [iamcco/markdown-preview.nvim](https://github.com/iamcco/markdown-preview.nvim)
- [OXY2DEV/markview.nvim](https://github.com/OXY2DEV/markview.nvim)

#### latex

- [lervag/vimtex](https://github.com/lervag/vimtex)
