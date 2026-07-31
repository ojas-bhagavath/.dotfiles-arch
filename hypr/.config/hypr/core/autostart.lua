-- See https://wiki.hypr.land/Configuring/Basics/Autostart/
hl.on("hyprland.start", function()
	hl.exec_cmd("gnome-keyring-daemon --start --components=secrets")
	hl.exec_cmd(
		"dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP && noctalia --daemon && sleep 2 && keepassxc --minimized"
	)
	hl.exec_cmd("udiskie --tray --no-automount")
	hl.exec_cmd("systemctl --user start hyprpolkitagent")
end)
