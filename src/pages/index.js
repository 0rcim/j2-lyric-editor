import TextFileParser from "../libs/TextFileParser";
import HistoryStorageData from "../libs/HistoryStorageData";
import fecha from "../plugins/fecha";
import WxBoundingRect from "../libs/WxBoundingRect";

const wx_bg_rect = new WxBoundingRect();

const { wx_storage, history_storage, fav_storage } =  getApp().globalData;

Page(
	{
		mixins: [
			require("../mixin/themeChanged"), 
			require("../mixin/navigateTo"), 
			require("../mixin/readingTextFile"), 
			require("../mixin/messageToast"),
			require("../mixin/readingClipboardData"),
			require("../mixin/wxFileManagerReader"),
			require("../mixin/themeDialog"),
			require("../mixin/themeActionSheet")
		],
		data: {
			MAX_FILE_SIZE: 60 * 1024, /* 60Kb */
			MAX_LINE_LENGTH: 200,
			nav_bar_bg: "",
			history_list_by_month: [],
			month_date_title_elem_bd_data: [],
			current_month_date_text: "",
			scroll_to_y: 0
		},
		scrollTo (event) {
			const {scrollToYPosition} = event.currentTarget.dataset;
			wx.pageScrollTo(
				{
					scrollTop: scrollToYPosition << 0,
					duration: 200
				}
			);
		},
		onPageScroll ({ scrollTop }) {
			let d = this.data.month_date_title_elem_bd_data;
			for (let {monthDateText, top} of d) {
				if (scrollTop >= top) {
					this.setData(
						{
							current_month_date_text: monthDateText,
							scroll_to_y: top
						}
					);
					break;
				}
			}
			if (d[d.length-1] && scrollTop < d[d.length-1].top) this.setData({current_month_date_text: "", scroll_to_y: 0});
		},
		updateScrollAnchorPositionData () {
			return Promise.all(
				[
					wx_bg_rect.getBoundingClientRect(
						"#app-name",
						({bottom}, resolve) => resolve(bottom)
					),
					...this.data.history_list_by_month
					.map((item, index) => 
						wx_bg_rect.getBoundingClientRect(
							"#mdt-" + index, 
							({dataset: {monthDateText}, top}, resolve) => resolve({top, monthDateText})
						)
					)
					.reverse()
				]
			)
			.then(([nav_rect_bottom, ...bd_rects]) => {
				this.setData(
					{
						month_date_title_elem_bd_data: 
							bd_rects.map(
								({top, monthDateText}) => ({monthDateText, top: top - nav_rect_bottom - 10})
							)
					}
				);
				return new Promise(resolve => wx.nextTick(() => resolve()));
			});
		},
		updatePageHistoryList () {
			wx_storage.get("history")
			.then(list => {
				console.log(list);
				const history_list_by_month = HistoryStorageData.parseItemListGroupByMonth(
					history_storage,
					list
				);
				this.setData({history_list_by_month});
			})
			.catch(err => {
				console.error(err);
			});
			wx.nextTick(
				() => {
					this.updateScrollAnchorPositionData();
					wx.stopPullDownRefresh();
				}
			);
		},
		onLoad () {
			this.updatePageHistoryList();
			// const t = HistoryStorageData.parseItemListGroupByMonth(
			// 	history_storage,
			// 	[...new Array(400)]
			// 	.map((u, i) => {
			// 		let date = new Date(-i * 24 * 60 * 60 * 1000 +  1629688133639);
			// 		return (
			// 			{
			// 				a: date.valueOf(),
			// 				e: fecha.format(date, "YYYY-MM-DD HH"),
			// 				id: i
			// 			}
			// 		)
			// 	})
			// );
			// this.setData(
			// 	{history_list_by_month: t}
			// );
		},
		changeTheme () {
			getApp().themeChanged(
				this.data.theme === "dark" ? "light" : "dark"
			);
		},
		toImportClipboardData () {
			let that = this;
			this.readingClipboardData()
			.then(res => {
				const {data} = res;
				console.log("clipboard data->", data);
				let parser = new TextFileParser(data);
				if (parser.getOriginText().length > that.data.MAX_FILE_SIZE) {
					return Promise.reject({err_msg: "剪切板内容长度超过限制"});
				} else if (parser.getParsedLine().length > that.data.MAX_LINE_LENGTH) {
					return Promise.reject({err_msg: "剪切板内容超出最大行数：" + that.data.MAX_LINE_LENGTH});
				} else {
					getApp().globalData.temp_text_file_parser = parser;
					wx.navigateTo(
						{url: "form-lyric-lines/form-lyric-lines"}
					);
				}
			})
			.catch(err => {
				if ("err_msg" in err) that.showWarningToast({msg: err.err_msg});
				console.log("err->", err)
			});
		},
		toChooseMessageFile () {
			let that = this;
			let fsm = wx.getFileSystemManager();
			this.chooseMessageFile()
			.then(res => {
				console.log(res);
				if (res.errMsg === "chooseMessageFile:ok") {
					const [{name, path, size, time, type}] = res.tempFiles;
					let err_msg;
					if (size > that.data.MAX_FILE_SIZE) {
						err_msg = "文件体积大于60Kb";
					} else if (!/\.txt$/.test(name)) {
						err_msg = "仅支持TXT文件";
					}
					if (err_msg === undefined) {
						return new Promise((resolve, reject) => {
							fsm.readFile(
								{
									filePath: path,
									encoding: "utf-8",
									success: resolve,
									fail: reject
								}
							);
						});
					} else {
						return Promise.reject({err_msg});
					}
				} else {
					return Promise.reject({err_msg: "读取消息文件失败"});
				}
			})
			.then(res => {
				console.log("success->", res);
				const {data, errMsg} = res;
				if (errMsg === "readFile:ok") {
					let text_file_parser = new TextFileParser(data);
					let parsed_line = text_file_parser.getParsedLine();
					if (parsed_line.length > that.data.MAX_LINE_LENGTH) {
						return Promise.reject({err_msg: "TXT文件超出最大行数：" + that.data.MAX_LINE_LENGTH});
					} else {
						return Promise.resolve(text_file_parser);
					}
				} else {
					return Promise.reject({err_msg: "TXT文件解析失败"});
				}
			})
			.then(parser => {
				getApp().globalData.temp_text_file_parser = parser;
				wx.navigateTo(
					{url: "form-lyric-lines/form-lyric-lines"}
				);
			})
			.catch(err => {
				if ("err_msg" in err) that.showWarningToast({msg: err.err_msg});
				console.log("err->", err)
			})
		},
		navigateToHistoryPreviewerPage (event) {
			const {historyId} = event.currentTarget.dataset;
			wx_storage.get("favorites")
			.then(fav_list => {
				const iFavList = fav_storage.parseFavList(fav_list);
				return iFavList.get(historyId)
			})
			.then(target_history_item_with_fav_level => {
				getApp().globalData.temp_history_item = target_history_item_with_fav_level;
				wx.navigateTo(
					{url: "history-item-previewer/history-item-previewer"}
				);
			})
			.catch(err => {
				console.log(err);
			});
		},
		openLyricActionSheet (event) {
			console.log(event);
			const {historyId, name} = event.currentTarget.dataset;
			this.openActionSheet(
				{
					title: name,
					menu_list:
					[
						{
							text: "查看详情",
							data_history_id: historyId,
							tap_event_name: "navigateToHistoryPreviewerPage"
						},
						{
							text: "删除",
							type: "warn",
							data_history_id: historyId,
							tap_event_name: "deleteHistoryItem"
						}
					]
				}
			);
		},
		deleteHistoryItem (event) {
			const {historyId} = event.currentTarget.dataset;
			console.log(historyId);
			wx_storage.set(
				"history",
				({history: history_list}) => {
					const others = history_list.filter(({id}) => id !== historyId);
					console.log("others", others)
					return others;
				}
			)
			.then(res => {
				console.log("f->delete history item");
				return wx_storage.set(
					"favorites",
					({favorites: lv_list}) => {
						for (let i=0; i<lv_list.length; i++) {
							const idx = lv_list[i].indexOf(historyId);
							lv_list[i].splice(idx, 1);
						}
						return lv_list;
					}
				);
			})
			.then(res => {
				console.log("f->delete fav idx");
				this.updatePageHistoryList();
			})
			.catch(err => {
				console.error(err);
			});
		},
		onPullDownRefresh () {
			this.updatePageHistoryList();
		},
		onShow () {
			if (getApp().globalData.history_changed) {
				wx.startPullDownRefresh();
				this.updatePageHistoryList();
				getApp().globalData.history_changed = false;
			}
		}
	}
);