local mod = "SUPER" -- Sets "Windows" key as main modifier
local ipc = "noctalia msg "

local terminal = "kitty"
local editor = "neovide"
local filemanager1 = "kitty -e yazi"
local filemanager2 = "dolphin"
local browser = "firefox"
local pdfviewer = "sioyek --new-window"

-- example binds, see https://wiki.hypr.land/Configuring/Basics/Binds/ for more

hl.gesture({ fingers = 3, direction = "horizontal", action = "workspace" })

-- applications
hl.bind(mod .. " + Return", hl.dsp.exec_cmd(terminal), { description = "launch terminal" })
hl.bind(mod .. " + T", hl.dsp.exec_cmd(terminal), { description = "launch terminal" })
hl.bind(mod .. " + N", hl.dsp.exec_cmd(editor), { description = "launch text editor" })
hl.bind(mod .. " + E", hl.dsp.exec_cmd(filemanager1), { description = "launch primary file manager" })
hl.bind(mod .. " + SHIFT + E", hl.dsp.exec_cmd(filemanager2), { description = "launch secondary file manager" })
hl.bind(mod .. " + B", hl.dsp.exec_cmd(browser), { description = "launch web browser" })
hl.bind(mod .. " + S", hl.dsp.exec_cmd(pdfviewer), { description = "launch pdf viewer" })
hl.bind(mod .. " + Comma", hl.dsp.exec_cmd(ipc .. "settings-toggle"), { description = "launch noctalia settings" })
hl.bind(mod .. " + Space", hl.dsp.exec_cmd(ipc .. "panel-toggle launcher"), { description = "launch noctalia menu" })
hl.bind(mod .. " + V", hl.dsp.exec_cmd(ipc .. "panel-toggle clipboard"), { description = "launch noctalia clipboard" })

hl.bind("Print", hl.dsp.exec_cmd(ipc .. "screenshot-region"), { description = "screenshot a region" })
hl.bind(
	"SHIFT + Print",
	hl.dsp.exec_cmd(ipc .. "screenshot-fullscreen pick"),
	{ description = "screenshot the whole screen" }
)

hl.bind(mod .. " + X", hl.dsp.exec_cmd(ipc .. "session lock"))
hl.bind("XF86PowerOff", hl.dsp.exec_cmd(ipc .. "panel-toggle session"))
-- window actions
hl.bind(mod .. " + Q", hl.dsp.window.close())
hl.bind("ALT + F4", hl.dsp.window.close())
hl.bind("ALT + Tab", hl.dsp.exec_cmd(ipc .. "window-switcher"))
hl.bind(mod .. " + SHIFT + F", hl.dsp.window.fullscreen({ "maximized", "toggle" }))
hl.bind("F11", hl.dsp.window.fullscreen({ "maximized", "toggle" }))
hl.bind(mod .. " + F", hl.dsp.window.float({ action = "toggle" }))
hl.bind(mod .. " + P", hl.dsp.window.pseudo())

-- focus
hl.bind(mod .. " + left", hl.dsp.focus({ direction = "left" }))
hl.bind(mod .. " + right", hl.dsp.focus({ direction = "right" }))
hl.bind(mod .. " + up", hl.dsp.focus({ direction = "up" }))
hl.bind(mod .. " + down", hl.dsp.focus({ direction = "down" }))
hl.bind(mod .. " + H", hl.dsp.focus({ direction = "left" }))
hl.bind(mod .. " + L", hl.dsp.focus({ direction = "right" }))
hl.bind(mod .. " + J", hl.dsp.focus({ direction = "up" }))
hl.bind(mod .. " + K", hl.dsp.focus({ direction = "down" }))

hl.bind(mod .. " + SHIFT + left", hl.dsp.window.move({ direction = "left" }))
hl.bind(mod .. " + SHIFT + right", hl.dsp.window.move({ direction = "right" }))
hl.bind(mod .. " + SHIFT + up", hl.dsp.window.move({ direction = "up" }))
hl.bind(mod .. " + SHIFT + down", hl.dsp.window.move({ direction = "down" }))

hl.bind(mod .. " + SHIFT + H", hl.dsp.window.move({ direction = "left" }))
hl.bind(mod .. " + SHIFT + L", hl.dsp.window.move({ direction = "right" }))
hl.bind(mod .. " + SHIFT + J", hl.dsp.window.move({ direction = "up" }))
hl.bind(mod .. " + SHIFT + K", hl.dsp.window.move({ direction = "down" }))
for i = 1, 10 do
	local key = i % 10 -- 10 maps to key 0
	hl.bind(mod .. " + " .. key, hl.dsp.focus({ workspace = i }))
	hl.bind(mod .. " + SHIFT + " .. key, hl.dsp.window.move({ workspace = i }))
end
hl.bind(mod .. " + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
hl.bind(mod .. " + mouse_up", hl.dsp.focus({ workspace = "e-1" }))
hl.bind(mod .. " + mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind(mod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })
hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd(ipc .. "volume-up"))
hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd(ipc .. "volume-down"))
hl.bind("XF86AudioMute", hl.dsp.exec_cmd(ipc .. "volume-mute"))
hl.bind("XF86MonBrightnessUp", hl.dsp.exec_cmd(ipc .. "brightness-up"))
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd(ipc .. "brightness-down"))

hl.bind("XF86AudioNext", hl.dsp.exec_cmd(ipc .. "media next"), { locked = true })
hl.bind("XF86AudioPause", hl.dsp.exec_cmd(ipc .. "media toggle"), { locked = true })
hl.bind("XF86AudioPlay", hl.dsp.exec_cmd(ipc .. "media toggle"), { locked = true })
hl.bind("XF86AudioPrev", hl.dsp.exec_cmd(ipc .. "media previous"), { locked = true })
