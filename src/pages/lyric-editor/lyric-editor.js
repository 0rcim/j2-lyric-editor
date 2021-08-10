import LyricLines from "../../libs/LyricLines";

Page(
	{
		mixins: [
			require("../../mixin/themeChanged"),
			require("../../mixin/messageToast"),
			require("../../mixin/coutdownAnimation"),
			require("../../mixin/themeDialog")
		],
		data: {
			_picker_changed: false,
			lyrics: [],
			_previous_line_index: 0,
			current_line_idx: 0,
			COUNTDOWN_NUM: 5,
			recording_status: 0
		},
		onLoad () {
			const has_temp_lyric_lines = getApp().globalData.temp_lyric_lines instanceof LyricLines;
			if (has_temp_lyric_lines) {
				this.showLoadingToast();
				let lyric_lines = getApp().globalData.temp_lyric_lines;
				this.setData(
					{
						lyrics: lyric_lines.getLyricLines()
					}
				);
			}
		},
		bindLineChange (event) {
			const {value: [idx]} = event.detail;
			this.setData(
				{current_line_idx: idx, _previous_line_index: idx, _picker_changed: true}
			);
		},
		bindLinePickStart () {
			
		},
		bindLinePickEnd () {

		},
		bindCountDownEnd () {
			console.log("...end...")
			this.setData(
				{recording_status: 1}
			);
		},
		openConfirmUseBackgroundAudioDialog () {
			this.openDialog(
				{
					title: "使用背景音频",
					content: "将背景音频导入小程序同步播放，或者在手机后台播放音乐以开始记录歌词时间轴",
					btn: 
					[
						{
							text: "不再提示",
							type: "default",
							tap_event_name: "playCountdownAnimate"
						},
						{
							text: "导入音频",
							type: "primary",
						}
					]
				}
			);
		}
	}
);