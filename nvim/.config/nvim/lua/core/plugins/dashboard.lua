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
                statusline = true,
            },
            config = {
                disable_move = true,
                header = vim.split(logo, "\n"),
                center = {
                    {
                        action = "ene | startinsert",
                        desc = " New file",
                        icon = " ",
                        key = "n",
                    },
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
                            require("yazi").yazi(nil, vim.fn.expand("$HOME/.dotfiles/"))
                        end,
                        desc = " Dotfiles",
                        icon = " ",
                        key = "d",
                    },
                    {
                        action = function()
                            require("yazi").yazi(nil, vim.fn.expand("$HOME/.config/nvim/"))
                        end,
                        desc = " Neovim Config",
                        icon = " ",
                        key = "c",
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
                    return {
                        "  Neovim loaded " .. stats.loaded .. "/" .. stats.count .. " plugins in " .. ms .. "ms",
                    }
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
