import TextFileParser from "../../libs/TextFileParser";

Page(
	{
		mixins: [require("../../mixin/themeChanged"), require("../../mixin/messageToast")],
		data: {
			lines: 3,
			lyric_group: [],
			focused_line: 0,
			loading_toast: false
		},
		onLoad () {
			let that = this;
			const has_temp_file = getApp().globalData.temp_text_file_parser instanceof TextFileParser;
			if (has_temp_file) {
				this.showLoadingToast();
				let parsed_lines = getApp().globalData.temp_text_file_parser.getParsedLine();
				this.setData(
					{
						lines: parsed_lines.length,
						lyric_group: parsed_lines
					}
				);
				wx.nextTick(() => {
					that.hideLoadingToast();
				});
				getApp().globalData.temp_text_file_parser = null;
			} else {
				this.setData(
					{
						lyric_group: [...new Array(this.data.lines)].map(() => "")
					}
				);
			}
		},
		bindNext (event) {
			let that = this;
			console.log(event);
			const {id} = event.currentTarget.dataset;
			const {value} = event.detail;
			this.setData(
				{
					lines: id === that.data.lines - 1 ? that.data.lines + 1 : that.data.lines,
					lyric_group: 
					(function () {
						let temp = [...that.data.lyric_group];
						temp[id] = value;
						if (id === that.data.lines - 1) temp[temp.length] = "";
						return temp;
					})(),
					focused_line: that.data.focused_line + 1
				}
			);
		},
		bindFocus (event) {
			const {id} = event.currentTarget.dataset;
			this.setData(
				{focused_line: id}
			);
		},
		bindInsertLineAfter (event) {
			const {id} = event.currentTarget.dataset;

			let that = this;
			this.setData(
				{
					lines: this.data.lines + 1,
					lyric_group: 
					(function () {
						let temp = [...that.data.lyric_group];
						temp.splice(id + 1, 0, "");
						return temp;
					})(),
					focused_line: -1
				}
			);
		},
		bindChange (event) {
			let that = this;
			const {id} = event.currentTarget.dataset;
			const {value} = event.detail;
			this.setData(
				{
					lyric_group: 
					(function () {
						let temp = [...that.data.lyric_group];
						temp[id] = value;
						return temp;
					})(),
					focused_line: -1
				}
			);
		},
		bindRemoveLine (event) {
			let that = this;
			const {id} = event.currentTarget.dataset;
			this.setData(
				{
					lines: that.data.lines - 1,
					lyric_group:
					(function () {
						let temp = [...that.data.lyric_group];
						temp[id] = null;
						return temp.filter(item => item !== null);
					})()
				}
			);
		},
		bindAddNewLyricLine (event) {
			let that = this;
			this.setData(
				{
					lines: this.data.lines + 1,
					lyric_group: 
					(function () {
						let temp = [...that.data.lyric_group];
						temp[temp.length] = "";
						return temp;
					})(),
					focused_line: -1
				}
			);
		}
	}
);