import LyricLines from "../../libs/LyricLines";
import fecha from "../../plugins/fecha";
import {FILE_EXT_DATE_MASK, STOP_WATCH_MASK} from "../../libs/fecha.mask";
import WxBgAudioPlayer from "../../libs/WxBgAudioPlayer";

Page(
	{
		mixins: [
			require("../../mixin/themeChanged"),
			require("../../mixin/messageToast"),
			require("../../mixin/coutdownAnimation"),
			require("../../mixin/themeDialog"),
			require("../../mixin/lyricEditorTimerUtil"),
			require("../../mixin/readingAsBgAudio")
		],
		data: {
			audio_round_progress_bg_img_style_text: "",
			audio_duration_time_text: "",
			bg_audio_player: null,
			swiper_current_index: 0,
			lyrics: [],
			current_line_idx: 0,
			COUNTDOWN_NUM: 1,
			never_open_confirm_use_background_audio_dialog: false,
			recording_status: 0,
			current_recording_line_idx: 0,
			lyric_line_stamps: [],
			// action-music-lyric-previewer
			lyric_time_lines: [],
			current_player_lyric_line_index: 0
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
		// actoin-recording-lyric
		bindCurrentActionContainerChange (event) {
			const {current} = event.detail;
			this.setData(
				{swiper_current_index: current}
			);
		},
		bindRecordingLyricLineChange (event) {
			const {value: [idx]} = event.detail;
			this.setData(
				{current_line_idx: idx}
			);
		},
		bindPlayerLyricLineChange (event) {
			const {value: [idx]} = event.detail;
			this.setData(
				{current_player_lyric_line_index: idx}
			);
		},
		bindLinePickStart () {
			
		},
		bindLinePickEnd () {

		},
		bindCountDownEnd () {
			let that = this;
			console.log("...end...");
			const wx_bg_audio_player = getApp().globalData.wx_bg_audio_player;
			if (this.data.recording_status === 3) {
				this.startStopWatch();
				wx_bg_audio_player && wx_bg_audio_player.continuePlay(that);
				this.setData(
					{recording_status: 1}
				);
			} else {
				this.setData(
					{
						recording_status: 1,
						current_line_idx: 0,
						current_recording_line_idx: 0
					}
				);
				const onAudioEnded = function () {
					that.bindCompleteLyricRecording();
				};
				wx.nextTick(
					() => {
						that.init_lrc_timer(
							() => {
								that.startStopWatch();
								wx_bg_audio_player && wx_bg_audio_player.startPlay(that, onAudioEnded);
							}
						);
					}
				);
			}
		},
		openConfirmUseBackgroundAudioDialog (event) {
			this.data.never_open_confirm_use_background_audio_dialog
			? this.playCountdownAnimate(event)
			: this.data.recording_status === 3
				? this.playCountdownAnimate(event)
				: getApp().globalData.wx_bg_audio_player !== null
				 ? this.playCountdownAnimate(event)
				 : this.openDialog(
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
								tap_event_name: "toChooseMessageBgAudio"
							}
						]
					}
				);
		},
		bindPauseStopWatch () {
			let that = this;
			this.pauseStopWatch(() => {
				const wx_bg_audio_player = getApp().globalData.wx_bg_audio_player;
				wx_bg_audio_player && wx_bg_audio_player.pause();
				that.setData(
					{
						recording_status: 3
					}
				);
			});
		},
		bindResetStopWatch () {
			let that = this;
			this.endStopWatch(
				() => {
					that.resetLyricEditor();
				}
			)
		},
		goNextLyricLine () {
			let stamp = this.getTime();
			console.log("%d stamp->", this.data.current_recording_line_idx, stamp);
			this.setData(
				{
					current_recording_line_idx: this.data.current_recording_line_idx + 1,
					current_line_idx: this.data.current_recording_line_idx + 1,
					lyric_line_stamps: this.data.lyric_line_stamps.concat([stamp]),
					recording_status: 
						this.data.current_recording_line_idx < this.data.lyrics.length - 2
						? 1 // 正在录制下一行
						: 2 // 正在录制最后一句歌词，即将完成
				}
			);
		},
		bindCompleteLyricRecording () {
			let that = this;
			let last_lyric_line_time = this.getTime();
			const wx_bg_audio_player = getApp().globalData.wx_bg_audio_player;
			wx_bg_audio_player && wx_bg_audio_player.pause();
			this.endStopWatch(
				() => {
					that.setData(
						{
							recording_status: 0,
							current_recording_line_idx: this.data.current_recording_line_idx + 1,
							lyric_line_stamps: this.data.lyric_line_stamps.concat([last_lyric_line_time]),
						}
					);
				}
			);
			let inf = getApp().globalData.temp_lyric_lines.inf;
			let file_full_name = 
				`${inf.inputName || this.data.bg_audio_player.audio_full_file_name || inf.placeholderName /* temp_lyric_lines_inf.songName || this.data.audio_full_file_name */}` +
				`[${fecha.format(new Date(last_lyric_line_time), STOP_WATCH_MASK)}]` +
				`[${fecha.format(inf.createDate, FILE_EXT_DATE_MASK)}]` +
				'.lyric';
			this.openDialog(
				{
					title: "时间轴记录已保存",
					content: `名称：${file_full_name}，可在程序首页编辑历史查看，请选择下一步操作`,
					shadeClose: false,
					btn: 
					[
						{
							text: "重录一次",
							type: "default",
							tap_event_name: "resetLyricEditor"
						},
						{
							text: "预览并微调",
							type: "primary",
							tap_event_name: "switchLyricPlayer"
						},
					]
				}
			);
			this.makeLyricTimeFileText();
		},
		resetLyricEditor (callback) {
			const wx_bg_audio_player = getApp().globalData.wx_bg_audio_player;
			wx_bg_audio_player && wx_bg_audio_player.stop(this);
			this.setData(
				{
					recording_status: 0,
					current_recording_line_idx: 0,
					current_line_idx: 0,
					lyric_line_stamps: []
				}
			);
			wx.nextTick(
				() => {
					typeof callback === "function" && callback();
				}
			);
		},
		switchLyricPlayer () {
			this.resetLyricEditor(
				() => {
					this.setData(
						{
							swiper_current_index: 1
						}
					);
				}
			);
		},
		makeLyricTimeFileText () {
			let temp_arr = [];
			for (let text of this.data.lyrics.filter(item => item !== '___PRE_LINE___')) {
				temp_arr.push(
					{text, time: this.data.lyric_line_stamps[temp_arr.length]}
				);
			}
			console.log(temp_arr);
		},
		// === action-music-lyric-previewer
		toChooseMessageBgAudio () {
			let that = this;
			this.chooseMessageFileAsBgAudio()
			.then(res => {
				console.log(res);
				const {tempFiles: [tempFile]} = res;
				let wx_bg_audio_player = 
					getApp().globalData.wx_bg_audio_player = 
					new WxBgAudioPlayer(tempFile)
				;
				that.setData(
					{
						bg_audio_player: wx_bg_audio_player,
					}
				);
				wx_bg_audio_player.setRoundProgressBgImgDataKeyName(
					"audio_round_progress_bg_img_style_text"
				);
				wx_bg_audio_player.setDurationTimeTextDataKeyName(
					"audio_duration_time_text"
				);
				// wx_bg_audio_player.audio_ctx.onCanplay(
				// 	() => {
				// 		wx_bg_audio_player.onTimeUpdate(
				// 			() => {
				// 				console.log("....")
				// 				that.setData(
				// 					{
				// 						audio_round_progress_bg_img_style_text:
				// 						`background-image:url(${wx_bg_audio_player.getRoundProgressBackgroundImage()})`
				// 					}
				// 				);
				// 			}
				// 		);
				// 	}
				// );
				console.log("playing music:", tempFile);
			})
			.catch(err => {
				if ("err_msg" in err) 
					that.showTextToast({msg: err.err_msg, time: 5000});
				console.log(err);
			})
		}
	}
);