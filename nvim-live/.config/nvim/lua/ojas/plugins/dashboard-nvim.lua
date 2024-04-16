return {
	"nvimdev/dashboard-nvim",
	event = "VimEnter",
	opts = function()
		local logo = [[
 ┏┳┓┏━┓  ┏━┓┏┓┏┏━┓  ┏┳┓┳ ┳┳┏┓┏┏━┓
  ┃┃┃ ┃  ┃ ┃┃┃┃┣┫    ┃ ┣━┫┃┃┃┃┃ ┳
 ━┻┛┗━┛  ┗━┛┛┗┛┗━┛   ┻ ┻ ┻┻┛┗┛┗━┛
 ┏━┓┏┓┏┏┳┓  ┏┳┓┏━┓  ┳┏┳┓  ┳ ┳┏━┓┳  ┳  
 ┣━┫┃┃┃ ┃┃   ┃┃┃ ┃  ┃ ┃   ┃┃┃┣┫ ┃  ┃  
 ┻ ┻┛┗┛━┻┛  ━┻┛┗━┛  ┻ ┻   ┗┻┛┗━┛┻━┛┻━┛

        ]]

		logo = string.rep("\n", 6) .. logo .. "\n\n"

		local opts = {
			theme = "doom",
			hide = {
				bufferline = true,
				statusline = false,
			},
			config = {
				disable_move = true,
				header = vim.split(logo, "\n"),
				center = {
					{
						action = "Telescope find_files",
						desc = " Find File",
						icon = " ",
						key = "f",
					},
					{
						action = "Telescope oldfiles",
						desc = " Recent Files",
						icon = " ",
						key = "r",
					},
					{
						action = "SessionManager load_last_session",
						desc = " Restore Session",
						icon = " ",
						key = "s",
					},
					{
						action = function()
							MiniFiles.open(vim.fn.expand("$HOME/.dotfiles/"), false)
						end,
						desc = " Dotfiles",
						icon = " ",
						key = "d",
					},
					{
						action = function()
							MiniFiles.open(vim.fn.expand("$HOME/.config/nvim/"), false)
						end,
						desc = " Neovim Config",
						icon = " ",
						key = "c",
					},
					{
						action = "Telescope live_grep",
						desc = " Find Text",
						icon = " ",
						key = "t",
					},
					{
						action = "Lazy",
						desc = " Lazy",
						icon = "󰒲 ",
						key = "l",
					},
					{
						action = "qa",
						desc = " Quit",
						icon = " ",
						key = "q",
					},
				},
				footer = function()
					local stats = require("lazy").stats()
					local ms = (math.floor(stats.startuptime * 100 + 0.5) / 100)
					return { "⚡ Neovim loaded " .. stats.loaded .. "/" .. stats.count .. " plugins in " .. ms .. "ms" }
				end,
			},
		}
		for _, button in ipairs(opts.config.center) do
			button.desc = button.desc .. string.rep(" ", 43 - #button.desc)
			button.key_format = "  %s"
		end
		if vim.o.filetype == "lazy" then
			vim.cmd.close()
			vim.api.nvim_create_autocmd("User", {
				pattern = "DashboardLoaded",
				callback = function()
					require("lazy").show()
				end,
			})
		end
		return opts
	end,
}
