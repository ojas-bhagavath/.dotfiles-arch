return {
	"echasnovski/mini.files",
	version = false,
	dependencies = { "nvim-tree/nvim-web-devicons" },
	event = "VeryLazy",
	keys = {
		{
			"<leader>e",
			function()
				if not MiniFiles.close() then
					MiniFiles.open(vim.api.nvim_buf_get_name(0), false)
				end
			end,
			desc = "File Explorer (cwd)",
		},
		{
			"<leader>E",
			function()
				if not MiniFiles.close() then
					MiniFiles.open(vim.fn.expand("$HOME/"), false)
				end
			end,
			desc = "File Explorer (cwd)",
		},
	},
	config = function()
		require("mini.files").setup({
			mappings = {
				go_in = "L",
				go_in_plus = "l",
			},
			options = {
				permanent_delete = false,
				use_as_default_explorer = true,
			},
		})
	end,
}
