return {
	"epwalsh/obsidian.nvim",
    version = "*",
	lazy = true,
	ft = "markdown",
	dependencies = {
		"nvim-lua/plenary.nvim",
		"nvim-telescope/telescope.nvim",
		"hrsh7th/nvim-cmp",
	},
	opts = {
		workspaces = {
			{
				name = "Notes",
				path = "~/Stuff/Notes/",
			},
		},
	},
}
