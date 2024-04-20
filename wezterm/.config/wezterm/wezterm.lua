-- Pull in the wezterm API
local wezterm = require("wezterm")

-- This table will hold the configuration.
local config = {}

-- In newer versions of wezterm, use the config_builder which will
-- help provide clearer error messages
if wezterm.config_builder then
	config = wezterm.config_builder()
end

-- This is where you actually apply your config choices

-- For example, changing the color scheme:
config.color_scheme = "Tokyo Night Moon"
config.font = wezterm.font("Hack Nerd Font")
config.font_size = 16
config.enable_scroll_bar = true
config.hide_tab_bar_if_only_one_tab = true
config.window_close_confirmation = "NeverPrompt"
config.check_for_updates = false
config.warn_about_missing_glyphs = false
config.enable_wayland = false

-- and finally, return the configuration to wezterm
return config
