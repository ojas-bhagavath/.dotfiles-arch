-- Refer to https://wiki.hypr.land/Configuring/Basics/Variables/
hl.config({
	general = {
		border_size = 3,
		gaps_in = 0,
		gaps_out = 0,
		col = {
			active_border = "rgba(c099ffff)",
			inactive_border = "rgba(222436aa)",
		},
		layout = "dwindle",
	},
	animations = {
		enabled = true,
	},
	input = {
		kb_options = "caps:escape_shifted_capslock",
		touchpad = {
			natural_scroll = true,
			middle_button_emulation = true,
		},
	},
	gestures = {},
})
