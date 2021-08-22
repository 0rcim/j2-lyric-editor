require("./libs/Mixins");

const themeListeners = [];

App(
	{
		globalData: {
			theme: "light",
			fsm: null,
			temp_text_file_parser: null,
			temp_lyric_lines: null/*  || require("./libs/test_things").lyric_lines */,
			wx_bg_audio_player: null,
			temp_lyric_time_lines: null/*  || require("./libs/test_things").lyric_time_lines */,
			wx_audio_fragment_player: null,
			temp_audio_fragment_buffer_parts: null
		},
		themeChanged (theme) {
			this.globalData.theme = theme;
			themeListeners.forEach((listener) => {
				listener(theme);
			});
		},
		watchThemeChange (listener) {
			if (themeListeners.indexOf(listener) < 0) {
				themeListeners.push(listener);
			}
		},
		unWatchThemeChange (listener) {
			const index = themeListeners.indexOf(listener);
			if (index > -1) {
				themeListeners.splice(index, 1);
			}
		}
	}
);