local wezterm = require("wezterm")

local config = wezterm.config_builder()

config = {
	adjust_window_size_when_changing_font_size = false,
	automatically_reload_config = true,
	bold_brightens_ansi_colors = "BrightAndBold",
	check_for_updates = false,
	color_scheme = "Tokyo Night Moon",
	cursor_blink_ease_out = "Constant",
	cursor_blink_ease_in = "Constant",
	cursor_blink_rate = 600,
	enable_kitty_graphics = true,
	enable_scroll_bar = true,
	enable_wayland = false,
	font = wezterm.font("Hack Nerd Font"),
	font_size = 16,
	hide_tab_bar_if_only_one_tab = true,
	initial_cols = 120,
	initial_rows = 35,
	max_fps = 120,
	term = "xterm-kitty",
	warn_about_missing_glyphs = false,
	window_close_confirmation = "NeverPrompt",
	window_decorations = "RESIZE",
}

return config
