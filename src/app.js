require("./libs/Mixins");

const themeListeners = [];

App(
	{
		globalData: {
			theme: "light",
			fsm: null,
			temp_text_file_parser: null,
			temp_lyric_lines: null
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