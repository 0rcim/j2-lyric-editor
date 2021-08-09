import TextFileParser from "../libs/TextFileParser";
Page(
	{
		mixins: [
			require("../mixin/themeChanged"), 
			require("../mixin/navigateTo"), 
			require("../mixin/readingTextFile"), 
			require("../mixin/messageToast"),
			require("../mixin/readingClipboardData"),
			require("../mixin/wxFileManagerReader")
		],
		data: {
			MAX_FILE_SIZE: 60 * 1024, /* 60Kb */
			MAX_LINE_LENGTH: 200
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
						err_msg = "文件体积大于100Kb";
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
		}
	}
);