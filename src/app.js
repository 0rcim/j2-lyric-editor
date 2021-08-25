import WxStorage from "./libs/WxStorage";
import HistoryStorageData from "./libs/HistoryStorageData";

const wx_storage = new WxStorage();
const history_storage = new HistoryStorageData();

require("./libs/Mixins");

const themeListeners = [];

App(
	{
		globalData: {
			theme: wx_storage.getSync("settings.theme"),
			fsm: null,
			temp_history_item: null,
			temp_text_file_parser: null,
			temp_lyric_lines: null/*  || require("./libs/test_things").lyric_lines */,
			wx_bg_audio_player: null,
			temp_lyric_time_lines: null/*  || require("./libs/test_things").lyric_time_lines */,
			wx_audio_fragment_player: null,
			temp_audio_fragment_buffer_parts: null,
			wx_storage,
			history_storage
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