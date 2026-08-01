-- See https://wiki.hypr.land/Configuring/Advanced-and-Cool/Environment-variables/
hl.env("XCURSOR_SIZE", "24")
hl.env("HYPRCURSOR_SIZE", "24")
hl.env("XDG_CURRENT_DESKTOP", "Hyprland")
hl.env("XDG_SESSION_TYPE", "wayland")
hl.env("XDG_SESSION_DESKTOP", "Hyprland")
hl.env("QT_QPA_PLATFORM", "wayland")
hl.env("QT_QPA_PLATFORMTHEME", "kde")
hl.env("QT_AUTO_SCREEN_SCALE_FACTOR", "1.5")

-- XDG Base Directories
hl.env("XDG_CONFIG_HOME", os.getenv("HOME") .. "/.config")
hl.env("XDG_CACHE_HOME", os.getenv("HOME") .. "/.cache")
hl.env("XDG_DATA_HOME", os.getenv("HOME") .. "/.local/share")
hl.env("XDG_STATE_HOME", os.getenv("HOME") .. "/.local/state")
hl.env("DOTFILES", os.getenv("HOME") .. "/.dotfiles")

-- Default Applications
hl.env("TERMINAL", "kitty")
hl.env("EDITOR", "neovide")
hl.env("VISUAL", "neovide")
hl.env("BROWSER", "firefox")
hl.env("FILEMANAGER", "yazi")

-- Tool/Runtime Directories
hl.env("GNUPGHOME", os.getenv("HOME") .. "/.gnupg")
hl.env("CARGO_HOME", os.getenv("HOME") .. "/.local/share/cargo")
hl.env("GOPATH", os.getenv("HOME") .. "/.local/share/go")
hl.env("RUSTUP_HOME", os.getenv("HOME") .. "/.local/share/rustup")

-- PATH Construction
hl.env(
	"PATH",
	os.getenv("PATH")
		.. ":"
		.. os.getenv("HOME")
		.. "/.local/bin"
		.. ":"
		.. os.getenv("HOME")
		.. "/.scripts"
		.. ":"
		.. os.getenv("HOME")
		.. "/.local/share/cargo/bin"
		.. ":"
		.. os.getenv("HOME")
		.. "/.local/share/pnpm"
		.. ":"
		.. os.getenv("HOME")
		.. "/.elan/bin"
)
