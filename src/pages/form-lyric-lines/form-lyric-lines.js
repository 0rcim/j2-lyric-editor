import TextFileParser from "../../libs/TextFileParser";
import fecha from "../../plugins/fecha";
import LyricLines from "../../libs/LyricLines";

Page(
	{
		mixins: [require("../../mixin/themeChanged"), require("../../mixin/messageToast")],
		data: {
			lines: 3,
			lyric_group: [],
			focused_line: 0,
			loading_toast: false,
			song_name_default_placeholder: "",
			createDate: null,
			song_name: ""
		},
		onLoad () {
			let that = this;
			const has_temp_file = getApp().globalData.temp_text_file_parser instanceof TextFileParser;
			const now = new Date();
			const song_name_default_placeholder = fecha.format(now, "MMDD HH:mm:ss");
			if (has_temp_file) {
				this.showLoadingToast();
				let parsed_lines = getApp().globalData.temp_text_file_parser.getParsedLine();
				this.setData(
					{
						lines: parsed_lines.length,
						lyric_group: parsed_lines,
						song_name_default_placeholder,
						createDate: now
					}
				);
				wx.nextTick(() => {
					that.hideLoadingToast();
				});
				getApp().globalData.temp_text_file_parser = null;
			} else {
				this.setData(
					{
						lyric_group: [...new Array(this.data.lines)].map(() => ""),
						song_name_default_placeholder,
						createDate: now
					}
				);
			}
		},
		bindInputSongName (event) {
			this.setData(
				{song_name: event.detail.value}
			);
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
		},
		bindFormSubmit () {
			if (!this.data.lyric_group.some(Boolean)) {
				return this.showTextToast({msg: "至少输入一行歌词"});
			}
			let that = this;
			getApp().globalData.temp_lyric_lines = new LyricLines(
				that.data.lyric_group,
				{
					createDate: that.data.createDate,
					songName: that.data.song_name_default_placeholder || that.data.song_name
				}
			);
			wx.navigateTo(
				{url: "/pages/lyric-editor/lyric-editor"}
			)
		}
	}
);