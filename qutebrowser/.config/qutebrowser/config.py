# Autoconfig
config.load_autoconfig(False)

# Aliases
c.aliases = {
    "q": "close",
    "qa": "quit",
    "w": "session-save",
    "wq": "quit --save",
    "wqa": "quit --save",
    "r": "reload",
    "rr": "restart",
}

#Autosave
c.auto_save.interval = 15000
c.auto_save.session = False

# Backend
c.backend = "webengine"

# Command Bindings
c.bindings.commands = {
    "normal": {
        "A": "hint links spawn yt-dlp --prefer-ffmpeg --extract-audio --audio-format mp3 --audio-quality 0 -i --download-archive \"$HOME/YouTube/downloaded-audios.txt\" -o \"$HOME/YouTube/%(title)s.%(ext)s\" {hint-url}",
        "D": "hint links spawn yt-dlp -i --download-archive \"$HOME/YouTube/downloaded-videos.txt\" -o \"$HOME/YouTube/%(title)s.%(ext)s\" -f \"bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best\" {hint-url}",
        "V": "hint links spawn firefox {hint-url}",
        "<Ctrl-Shift-O>": "cmd-set-text -s :open -p",
        "<Ctrl-o>": "cmd-set-text -s :open -w",
        "ee": "spawn --userscript ~/.config/qutebrowser/qute-pass",
        "ep": "spawn --userscript ~/.config/qutebrowser/qute-pass --password-only",
        "eu": "spawn --userscript ~/.config/qutebrowser/qute-pass --username-only",
        "eo": "spawn --userscript ~/.config/qutebrowser/qute-pass --otp-only",
    }
}

# Keymap Bindings
c.bindings.key_mappings = {
    "<Ctrl-6>": "<Ctrl-^>",
    "<Ctrl-Enter>": "<Ctrl-Return>",
    "<Ctrl-I>": "<Tab>",
    "<Ctrl-J>": "<Return>",
    "<Ctrl-M>": "<Return>",
    "<Ctrl-[>": "<Escape>",
    "<Enter>": "<Return>",
    "<Shift-Enter>": "<Return>",
    "<Shift-Return>": "<Return>",
    "r": "nop"
}

# Changelog
c.changelog_after_upgrade = "minor"

# Colors
# Tokyonight Pallet:
background =    "#222436"
text =          "#c8d3f5"
black0 =        "#1d1d2b"
black1 =        "#444a73"
red =           "#ff757f"
green =         "#c3e88d"
yellow =        "#ffc777"
blue =          "#82aaff"
magenta =       "#c099ff"
cyan =          "#86e1fc"
white0 =        "#828bb8"
white1 =        "#c8d3f5"

c.colors.completion.category.bg = background
c.colors.completion.category.border.bottom = black0
c.colors.completion.category.border.top = white0
c.colors.completion.category.fg = text
c.colors.completion.even.bg = background
c.colors.completion.fg = text
c.colors.completion.item.selected.bg = black1
c.colors.completion.item.selected.border.bottom = black1
c.colors.completion.item.selected.border.top = black1
c.colors.completion.item.selected.fg = text
c.colors.completion.item.selected.match.fg = red
c.colors.completion.match.fg = red
c.colors.completion.odd.bg = black0
c.colors.completion.scrollbar.bg = black0
c.colors.completion.scrollbar.fg = black1
c.colors.contextmenu.disabled.bg = black0
c.colors.contextmenu.disabled.fg = white0
c.colors.contextmenu.menu.bg = background
c.colors.contextmenu.menu.fg = text
c.colors.contextmenu.selected.bg = white0
c.colors.contextmenu.selected.fg = red
c.colors.downloads.bar.bg = black0
c.colors.downloads.error.bg = red
c.colors.downloads.error.fg = background 
c.colors.downloads.start.bg = blue 
c.colors.downloads.start.fg = background 
c.colors.downloads.stop.bg = green
c.colors.downloads.stop.fg = background
c.colors.downloads.system.bg = "rgb"
c.colors.downloads.system.fg = "rgb"
c.colors.hints.bg = yellow
c.colors.hints.fg = black0
c.colors.hints.match.fg = text
c.colors.keyhint.bg = black0
c.colors.keyhint.fg = text
c.colors.keyhint.suffix.fg = text
c.colors.messages.error.bg = red
c.colors.messages.error.border = black0
c.colors.messages.error.fg = background
c.colors.messages.info.bg = white0
c.colors.messages.info.border = black0
c.colors.messages.info.fg = text
c.colors.messages.warning.bg = yellow
c.colors.messages.warning.border = black0
c.colors.messages.warning.fg = background
c.colors.prompts.bg = black0
c.colors.prompts.border = white0
c.colors.prompts.fg = text
c.colors.prompts.selected.bg = black1
c.colors.prompts.selected.fg = red
c.colors.statusbar.caret.bg = magenta
c.colors.statusbar.caret.fg = black0
c.colors.statusbar.caret.selection.bg = magenta
c.colors.statusbar.caret.selection.fg = black0
c.colors.statusbar.command.bg = black0
c.colors.statusbar.command.fg = text
c.colors.statusbar.command.private.bg = cyan
c.colors.statusbar.command.private.fg = background
c.colors.statusbar.insert.bg = green
c.colors.statusbar.insert.fg = background
c.colors.statusbar.normal.bg = black0
c.colors.statusbar.normal.fg = text
c.colors.statusbar.passthrough.bg = blue
c.colors.statusbar.passthrough.fg = background
c.colors.statusbar.private.bg = cyan
c.colors.statusbar.private.fg = background
c.colors.statusbar.progress.bg = text
c.colors.statusbar.url.error.fg = black1
c.colors.statusbar.url.fg = black1
c.colors.statusbar.url.hover.fg = black1
c.colors.statusbar.url.success.http.fg = black1
c.colors.statusbar.url.success.https.fg = black1
c.colors.statusbar.url.warn.fg = black1
c.colors.tabs.bar.bg = black0
c.colors.tabs.even.bg = black1
c.colors.tabs.even.fg = text
c.colors.tabs.indicator.error = red
c.colors.tabs.indicator.start = blue
c.colors.tabs.indicator.stop = green
c.colors.tabs.indicator.system = "rgb"
c.colors.tabs.odd.bg = black1
c.colors.tabs.odd.fg = text
c.colors.tabs.pinned.even.bg = black1
c.colors.tabs.pinned.even.fg = text
c.colors.tabs.pinned.odd.bg = black1
c.colors.tabs.pinned.odd.fg = text
c.colors.tabs.pinned.selected.even.bg = background
c.colors.tabs.pinned.selected.even.fg = text
c.colors.tabs.pinned.selected.odd.bg = background
c.colors.tabs.pinned.selected.odd.fg = text
c.colors.tabs.selected.even.bg = background
c.colors.tabs.selected.even.fg = text
c.colors.tabs.selected.odd.bg = background
c.colors.tabs.selected.odd.fg = text
c.colors.tooltip.bg = black0
c.colors.tooltip.fg = text
c.colors.webpage.preferred_color_scheme = "dark"

# Completions
c.completion.cmd_history_max_items = -1
c.completion.delay = 0
c.completion.height = "50%"
c.completion.min_chars = 1
c.completion.open_categories = ["searchengines", "quickmarks", "bookmarks", "history", "filesystem"]
c.completion.quick = True
c.completion.scrollbar.padding = 4
c.completion.scrollbar.width = 12
c.completion.show = "always"
c.completion.shrink = False
c.completion.timestamp_format = "%d-%m-%Y %H:%M"
c.completion.use_best_match = False
c.completion.web_history.max_items = -1

# Content
c.content.autoplay = True
c.content.blocking.adblock.lists = ["https://easylist.to/easylist/easylist.txt", "https://easylist.to/easylist/easyprivacy.txt"]
c.content.blocking.enabled = True
c.content.blocking.hosts.block_subdomains = True
c.content.blocking.method = "both"
c.content.cache.appcache = True
c.content.cache.maximum_pages = 12
c.content.canvas_reading = True
c.content.cookies.accept = "all"
c.content.cookies.store = True
c.content.default_encoding = "utf-8"
c.content.desktop_capture = "ask"
c.content.dns_prefetch = True
c.content.frame_flattening = False
c.content.fullscreen.overlay_timeout = 3000
c.content.fullscreen.window = False
c.content.geolocation = "ask"
config.set('content.headers.accept_language', '', 'https://matchmaker.krunker.io/*')
c.content.headers.do_not_track = True
c.content.headers.referer = "same-domain"
config.set('content.headers.user_agent', 'Mozilla/5.0 ({os_info}) AppleWebKit/{webkit_version} (KHTML, like Gecko) {upstream_browser_key}/{upstream_browser_version} Safari/{webkit_version}', 'https://web.whatsapp.com/')
config.set('content.headers.user_agent', 'Mozilla/5.0 ({os_info}; rv:90.0) Gecko/20100101 Firefox/90.0', 'https://accounts.google.com/*')
config.set('content.headers.user_agent', 'Mozilla/5.0 ({os_info}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99 Safari/537.36', 'https://*.slack.com/*')
c.content.hyperlink_auditing = False
c.content.images = True
c.content.javascript.alert = True
c.content.javascript.can_close_tabs = False
c.content.javascript.can_open_tabs_automatically = False
c.content.javascript.clipboard = "access"
c.content.javascript.enabled = True
c.content.javascript.log = {"error": "debug", "info": "debug", "unknown": "debug", "warning": "debug"}
c.content.javascript.log_message.excludes = {"userscript:_qute_stylesheet": ["*Refused to apply inline style because it violates the following Content Security Policy directive: *"]}
c.content.javascript.log_message.levels = {"qute:*": ["error"], "userscript:*": ["error"], "userscript:GM-*": []}
c.content.javascript.modal_dialog = False
c.content.javascript.prompt = True
c.content.local_content_can_access_file_urls = True
c.content.local_content_can_access_remote_urls = True
c.content.local_storage = True
c.content.media.audio_capture = "ask"
c.content.media.audio_video_capture = "ask"
c.content.media.video_capture = "ask"
c.content.mouse_lock = "ask"
c.content.mute = False
c.content.notifications.enabled = "ask"
c.content.notifications.presenter = "auto"
c.content.notifications.show_origin = True
c.content.pdfjs = False
c.content.persistent_storage = "ask"
c.content.plugins = True
c.content.prefers_reduced_motion = False
c.content.print_element_backgrounds = True
c.content.private_browsing = False
c.content.proxy = "system"
c.content.proxy_dns_requests = True
c.content.register_protocol_handler: True
c.content.site_specific_quirks.enabled = True
c.content.tls.certificate_errors = "ask"
c.content.unknown_url_scheme_policy = "allow-from-user-interaction"
c.content.webgl = True
c.content.webrtc_ip_handling_policy = "all-interfaces"
c.content.xss_auditing = False

# Downloads
c.downloads.location.prompt = True
c.downloads.location.remember = True
c.downloads.location.suggestion = "path"
c.downloads.position = "top"
c.downloads.prevent_mixed_content = False
c.downloads.remove_finished = 30000

# Editor
c.editor.command = ["foot", "-e", "nvim", "{file}", "-c", "normal {line}G{column0}1"]
c.editor.encoding = "utf-8"
c.editor.remove_file = True

# Fileselect
c.fileselect.handler = 'external'
c.fileselect.folder.command = ["foot", "-e", "yazi", "--chooser-file={}"]
c.fileselect.multiple_files.command = ["foot", "-e", "yazi", "--chooser-file={}"]
c.fileselect.single_file.command = ["foot", "-e", "yazi", "--chooser-file={}"]

# Fonts
c.fonts.default_family = "Hack Nerd Font"
c.fonts.default_size = "14pt"
c.fonts.completion.category = "bold default_size default_family"
c.fonts.completion.entry = "default_size default_family"
c.fonts.contextmenu = "default_size default_family"
c.fonts.debug_console = "default_size default_family"
c.fonts.downloads = "default_size default_family"
c.fonts.hints = "default_size default_family"
c.fonts.keyhint = "default_size default_family"
c.fonts.messages.error = "default_size default_family"
c.fonts.messages.info = "default_size default_family"
c.fonts.messages.warning = "default_size default_family"
c.fonts.prompts = "default_size default_family"
c.fonts.statusbar = "bold default_size default_family"
c.fonts.tabs.selected = "italic bold default_size default_family"
c.fonts.tabs.unselected = "default_size default_family"
c.fonts.tooltip = "default_size default_family"
c.fonts.web.size.default = 16
c.fonts.web.size.default_fixed = 13
c.fonts.web.size.minimum = 0
c.fonts.web.size.minimum_logical = 6

# Hints
c.hints.auto_follow = "unique-match"
c.hints.auto_follow_timeout = 0
c.hints.border = "1px solid #1e1e2e"
c.hints.chars = "asdfghjkl"
c.hints.dictionary = "/usr/share/dict/words"
c.hints.find_implementation = "python"
c.hints.hide_unmatched_rapid_hints = True
c.hints.leave_on_load = True
c.hints.min_chars = 1
c.hints.mode = "letter"
c.hints.next_regexes = ["\\bnext\\b", "\\bmore\\b", "\\bnewer\\b", "\\b[>\u2192\u226b]\\b", "\\b(>>|\u00bb)\\b", "\\bcontinue\\b"]
c.hints.padding = {"bottom": 0, "left": 3, "right": 3, "top": 0}
c.hints.prev_regexes = ["\\bprev(ious)?\\b", "\\bback\\b", "\\bolder\\b", "\\b[<\u2190\u226a]\\b", "\\b(<<|\u00ab)\\b"]
c.hints.radius = 3
c.hints.scatter = True
c.hints.uppercase = False

# History
c.history_gap_interval = 30

# Input
c.input.escape_quits_reporter = True
c.input.forward_unbound_keys = "auto"
c.input.insert_mode.auto_enter = True
c.input.insert_mode.auto_leave = True
c.input.insert_mode.auto_load = True
c.input.insert_mode.leave_on_load = True
c.input.insert_mode.plugins = True
c.input.links_included_in_focus_chain = True
c.input.match_counts = True
c.input.media_keys = True
c.input.mouse.back_forward_buttons = True
c.input.mouse.rocker_gestures = False
c.input.partial_timeout = 0
c.input.spatial_navigation = False

# Keyhint
c.keyhint.delay = 300
c.keyhint.radius = 6

# Logging
c.logging.level.console = "info"
c.logging.level.ram = "debug"

# Messages
c.messages.timeout = 3000

# New Instance
c.new_instance_open_target = "tab-silent"
c.new_instance_open_target_window = "last-focused"

# Prompt
c.prompt.filebrowser = True
c.prompt.radius = 8

# Qt
c.qt.chromium.experimental_web_platform_features = "auto"
c.qt.chromium.low_end_device_mode = "auto"
c.qt.chromium.process_model = "process-per-site-instance"
c.qt.force_software_rendering = "none"
c.qt.highdpi = False
c.qt.workarounds.locale = False
c.qt.workarounds.remove_service_workers = False

# Scrolling
c.scrolling.bar = "overlay"
c.scrolling.smooth = False

# Search
c.search.ignore_case = "smart"
c.search.incremental = True
c.search.wrap = True
c.search.wrap_messages = True


# Session
c.session.lazy_restore = True

# Spellcheck
c.spellcheck.languages = ["en-US"]

# Statusbar
c.statusbar.padding = {"bottom": 1, "left": 0, "right": 0, "top": 1}
c.statusbar.position = "bottom"
c.statusbar.show = "always"
c.statusbar.widgets = ["keypress", "search_match", "url", "scroll", "history", "tabs", "progress"]

# Tabs
c.tabs.background = True
c.tabs.close_mouse_button = "middle"
c.tabs.close_mouse_button_on_bar = "new-tab"
c.tabs.favicons.scale = 1.0
c.tabs.favicons.show = "always"
c.tabs.focus_stack_size = 10
c.tabs.indicator.padding = {"bottom": 0, "left": 3, "right": 3, "top": 0}
c.tabs.indicator.width = 4
c.tabs.last_close = "close"
c.tabs.max_width = 300
c.tabs.min_width = -1
c.tabs.mode_on_change = "restore"
c.tabs.mousewheel_switching = True
c.tabs.new_position.related = "next"
c.tabs.new_position.stacking = True
c.tabs.new_position.unrelated = "last"
c.tabs.padding = {"bottom": 0, "left": 5, "right": 5, "top": 0}
c.tabs.pinned.frozen = True
c.tabs.pinned.shrink = True
c.tabs.position = "top"
c.tabs.select_on_remove = "last-used"
c.tabs.show = "multiple"
c.tabs.show_switching_delay = 10000
c.tabs.tabs_are_windows = False
c.tabs.title.alignment = "left"
c.tabs.title.elide = "right"
c.tabs.title.format = "{audio}{index}{title_sep}{current_title}"
c.tabs.title.format_pinned = "{audio}"
c.tabs.tooltips = True
c.tabs.undo_stack_size = 100
c.tabs.width = "15%"
c.tabs.wrap = True

# URL
c.url.auto_search = "naive"
c.url.default_page = "file:///home/ojas/.config/qutebrowser/homepage/homepage.html"
c.url.incdec_segments = ["path", "query"]
c.url.open_base_url = True
c.url.searchengines = {
    'DEFAULT': 'https://search.brave.com/search?q={}',
    '1337x': 'https://1337x.to/search/{}/1/',
    'aa': 'https://annas-archive.org/search?q={}',
    'abb': 'https://audiobookbay.is/?s={}&tt=1',
    'am': 'https://www.amazon.in/s?k={}',
    'at': 'https://academictorrents.com/browse.php?search={}',
    'aur': 'https://aur.archlinux.org/packages?O=0&K={}',
    'aw': 'https://wiki.archlinux.org/index.php?search={}',
    'bs': 'https://bitsearch.to/search?q={}',
    'cpp': 'https://www.learncpp.com/gsearch/?q={}',
    'ctan': 'https://ctan.org/search?phrase={}',
    'disc': 'https://www.discogs.com/search?q={}&type=all',
    'dnf': 'https://packages.fedoraproject.org/search?query={}',
    'fd': 'https://search.f-droid.org/?q={}&lang=en',
    'fh': 'https://flathub.org/apps/search?q={}',
    'fk': 'https://www.flipkart.com/search?q={}',
    'gh': 'https://github.com/search?q={}',
    'gp': 'https://groupprops.subwiki.org/w/index.php?search={}',
    'gr': 'https://www.goodreads.com/search?q={}',
    'imdb': 'https://www.imdb.com/find/?q={}',
    'jc141': 'https://1337x.to/search/{} jc141/1/',
    'l2u': 'https://www.unicodeit.net/?{}',
    'lg': 'http://libgen.rs/search.php?req={}&sort=extension&sortmode=DESC',
    'maps': 'https://www.google.com/maps/search/{}',
    'mn': 'https://metanumbers.com/{}',
    'mse': 'https://math.stackexchange.com/search?q={}',
    'nix': 'https://search.nixos.org/packages?channel=24.05&from=0&size=50&sort=relevance&type=packages&query={}',
    'oeis': 'https://oeis.org/search?q={}',
    'pac': 'https://archlinux.org/packages/?sort=&q={}',
    'pw': 'https://proofwiki.org/w/index.php?search={}',
    'qxr': 'https://1337x.to/search/{} qxr/1/',
    'ri': 'https://www.reddit.com/search/?q={}',
    'syn': 'https://www.thesaurus.com/browse/{}',
    'tmdb': 'https://www.themoviedb.org/search?query={}',
    'tpb': 'https://thepiratebay.org/search.php?q={}',
    'tz2': 'https://torrentz2.nz/search?q={}',
    'ud': 'https://www.urbandictionary.com/define.php?term={}',
    'wa': 'https://www.wolframalpha.com/input?i2d=true&i={}',
    'wm': 'https://mathworld.wolfram.com/search/?query={}',
    'wp': 'https://www.wikiwand.com/en/{}',
    'yt': 'https://www.youtube.com/results?search_query={}',
    'yts': 'https://yts.mx/browse-movies/{}/all/all/0/latest/0/all',
}
c.url.start_pages = "https://monkeytype.com/"
c.url.yank_ignored_parameters = ["ref", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_name"]

# Windows
c.window.hide_decoration = False
c.window.title_format = "{perc}{current_title}{title_sep}qutebrowser"
c.window.transparent = True

# Zoom
c.zoom.default = "130%"
c.zoom.levels = ["25%", "33%", "50%", "67%", "75%", "90%", "100%", "110%", "125%", "150%", "175%", "200%", "250%", "300%", "400%", "500%"]
c.zoom.mouse_divider = 512
c.zoom.text_only = False
