return {
    "williamboman/mason-lspconfig.nvim",
    dependencies = {
        "williamboman/mason.nvim",
    },
    config = function()
        local servers = {
            "lua_ls",
            "cssls",
            "html",
            "pyright",
            "bashls",
            "jsonls",
            "texlab",
        }
        require("mason").setup {
            ui = {
                border = "rounded",
            },
        }
        require("mason-lspconfig").setup {
            ensure_installed = servers,
        }
    end
}
