const { fav_storage, wx_storage } = getApp().globalData;
import fecha from "../../plugins/fecha";
import {DEFAULT_LRC_TAG_TIME} from "../../libs/fecha.mask";
import {PL, EL} from "../../libs/LyricLines.const";

Page(
	{
		mixins: [
			require("../../mixin/themeChanged"),
			require("../../mixin/readingClipboardData")
		],
		data: {
			current: 1,
			fav_lv_list: [[], [], []]
		},
		onLoad () {
			wx_storage
			.get("favorites")
			.then(data => fav_storage.parseFavList(data).getAll())
			.then(fav_lv_list => {
				this.setData(
					{fav_lv_list}
				);
			})
			.catch(err => {
				console.error(err);
			});
		},
		bindCurrentChange (event) {
			const {current, source} = event.detail;
			this.setData({current});
		},
		setCurrent (event) {
			const {targetIndex} = event.currentTarget.dataset;
			this.setData(
				{current: targetIndex}
			);
		},
		setLrcStrToClipboard (event) {
			const {lv, index, historyId} = event.currentTarget.dataset;
			const target = this.data.fav_lv_list[lv-1][index];
			const str = target.lyric_time_lines.map(
				({text, time}) => `[${fecha.format(new Date(time), DEFAULT_LRC_TAG_TIME)}]${(text === PL || text === EL ? " " : text) || " "}`
			).join("\n");
			this.setClipboardData(str)
			.then(f => {
				console.log(f);
			})
			.catch(err => {
				console.error(err);
			});
		},
		navigateToHistoryPreviewerPage (event) {
			const {lv, index, historyId} = event.currentTarget.dataset;
			const target = this.data.fav_lv_list[lv-1][index];
			target.fav_level = lv;
			target.page_locked = true;
			getApp().globalData.temp_history_item = target;
			wx.navigateTo(
				{url: "../history-item-previewer/history-item-previewer"}
			);
		}
	}
);