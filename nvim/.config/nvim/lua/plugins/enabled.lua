return {
    { "stevearc/oil.nvim" },

    { "NvChad/nvim-colorizer.lua" },

    {
        "LazyVim/LazyVim",
        opts = {
            colorscheme = "tokyonight-moon",
        },
    },

    {
        "rcarriga/nvim-notify",
        opts = {
            level = 3,
            render = "minimal",
            stages = "static",
        },
    },

    {
        "windwp/nvim-autopairs",
        event = "InsertEnter",
        opts = {},
    },

    {
        "nvim-neo-tree/neo-tree.nvim",
        opts = {
            filesystem = {
                filtered_items = {
                    visible = true,
                },
                window = {
                    mappings = {
                        ["l"] = "open",
                        ["h"] = "navigate_up",
                    },
                },
            },
        },
    },

    {
        "L3MON4D3/LuaSnip",
        build = (not jit.os:find("Windows"))
                and "echo 'NOTE: jsregexp is optional, so not a big deal if it fails to build'; make install_jsregexp"
            or nil,
        dependencies = {
            "rafamadriz/friendly-snippets",
            config = function()
                require("luasnip.loaders.from_lua").load({ paths = "~/.config/nvim/snippets/" })
            end,
        },
        opts = {
            history = true,
            updateevents = "TextChanged,TextChangedI",
            enable_autosnippets = true,
            delete_check_events = "TextChanged",
        },
        -- stylua: ignore
        keys = {},
    },

    {
        "nvimdev/dashboard-nvim",
        opts = function()
            local logo = [[
  ⣴⣶⣤⡤⠦⣤⣀⣤⠆     ⣈⣭⣭⣿⣶⣿⣦⣼⣆        
   ⠉⠻⢿⣿⠿⣿⣿⣶⣦⠤⠄⡠⢾⣿⣿⡿⠋⠉⠉⠻⣿⣿⡛⣦      
     ⠈   ⠈⢿⣿⣟⠦⠄⣾⣿⣿⣷    ⠻⠿⢿⣿⣧⣄    
          ⣸⣿⣿⢧⠄⢻⠻⣿⣿⣷⣄⣀⠄⠢⣀⡀⠈⠙⠿⠄   
         ⢠⣿⣿⣿⠈⠄ ⠡⠌⣻⣿⣿⣿⣿⣿⣿⣿⣛⣳⣤⣀⣀  
  ⢠⣧⣶⣥⡤⢄⠄⣸⣿⣿⠘⠄ ⢀⣴⣿⣿⡿⠛⣿⣿⣧⠈⢿⠿⠟⠛⠻⠿⠄ 
 ⣰⣿⣿⠛⠻⣿⣿⡦⢹⣿⣷⠄  ⢊⣿⣿⡏  ⢸⣿⣿⡇ ⢀⣠⣄⣾⠄  
⣠⣿⠿⠛⠄⢀⣿⣿⣷⠘⢿⣿⣦⡀ ⢸⢿⣿⣿⣄ ⣸⣿⣿⡇⣪⣿⡿⠿⣿⣷⡄ 
⠙⠃   ⣼⣿⡟⠌⠄⠈⠻⣿⣿⣦⣌⡇⠻⣿⣿⣷⣿⣿⣿⠐⣿⣿⡇ ⠛⠻⢷⣄
     ⢻⣿⣿⣄⠄⠄ ⠈⠻⣿⣿⣿⣷⣿⣿⣿⣿⣿⡟⠄⠫⢿⣿⡆   ⠁
      ⠻⣿⣿⣿⣿⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⡟⢀⣀⣤⣾⡿⠃    
    ]]

            logo = string.rep("\n", 8) .. logo .. "\n\n"

            local opts = {
                theme = "doom",
                hide = {
                    -- this is taken care of by lualine
                    -- enabling this messes up the actual laststatus setting after loading a file
                    statusline = false,
                },
                config = {
                    header = vim.split(logo, "\n"),
                    -- stylua: ignore
                    center = {
                        { action = "Telescope find_files",                                     desc = " Find file",       icon = " ", key = "f" },
                        { action = "ene | startinsert",                                        desc = " New file",        icon = " ", key = "n" },
                        { action = "Telescope oldfiles",                                       desc = " Recent files",    icon = " ", key = "r" },
                        { action = "Telescope live_grep",                                      desc = " Find text",       icon = " ", key = "g" },
                        { action = [[lua require("lazyvim.util").telescope.config_files()()]], desc = " Config",          icon = " ", key = "c" },
                        { action = 'lua require("persistence").load()',                        desc = " Restore Session", icon = " ", key = "s" },
                        { action = "Lazy",                                                     desc = " Lazy",            icon = "󰒲 ", key = "l" },
                        { action = "qa",                                                       desc = " Quit",            icon = " ", key = "q" },
                    },
                    footer = function()
                        local stats = require("lazy").stats()
                        local ms = (math.floor(stats.startuptime * 100 + 0.5) / 100)
                        return {
                            "⚡ Neovim loaded " .. stats.loaded .. "/" .. stats.count .. " plugins in " .. ms .. "ms",
                        }
                    end,
                },
            }

            for _, button in ipairs(opts.config.center) do
                button.desc = button.desc .. string.rep(" ", 43 - #button.desc)
                button.key_format = "  %s"
            end

            -- close Lazy and re-open when the dashboard is ready
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
    },
}
