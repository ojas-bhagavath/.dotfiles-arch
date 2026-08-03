-- See https://wiki.hypr.land/Configuring/Basics/Monitors/
hl.monitor({
	output = "eDP-1",
	mode = "1920x1080",
	position = "auto",
	scale = 1,
})
hl.monitor({
	output = "",
	mode = "highres",
	scale = 1,
	mirror = "eDP-1",
})
