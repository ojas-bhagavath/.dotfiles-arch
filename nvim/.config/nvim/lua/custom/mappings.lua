local M = {}

M.general = {
	n = {
		[";"] = { ":", "Enter command mode", opts = { nowait = true } },
	},
	i = {
		["jk"] = { "<ESC>", "escape insert mode", opts = { nowait = true } },
		["kj"] = { "<ESC>", "escape insert mode", opts = { nowait = true } },
	},
	x = {
		["jk"] = { "<ESC>", "escape insert mode", opts = { nowait = true } },
		["kj"] = { "<ESC>", "escape insert mode", opts = { nowait = true } },
		["<S-j>"] = { ":move '>+1<CR>gv-gv", "Move the selected line upwards" },
		["<S-k>"] = { ":move '<-2<CR>gv-gv", "Move the selected line downwards" },
	},
}

M.nvimtree = {
	n = {
		["<leader>e"] = { "<cmd> NvimTreeToggle <CR>", "Toggle nvimtree" },
	},
}

return M
