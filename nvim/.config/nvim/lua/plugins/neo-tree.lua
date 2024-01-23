return {
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
}
