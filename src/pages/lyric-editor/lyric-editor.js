import LyricLines from "../../libs/LyricLines";
import WxBoundingRect from "../../libs/WxBoundingRect";
import LyricTimeLines from "../../libs/LyricTimeLines";
import fecha from "../../plugins/fecha";
import {EXACT_STOP_WATCH_MASK, FILE_EXT_DATE_MASK, STOP_WATCH_MASK} from "../../libs/fecha.mask";
import WxBgAudioPlayer from "../../libs/WxBgAudioPlayer";

Page(
	{
		mixins: [
			require("../../mixin/themeChanged"),
			require("../../mixin/messageToast"),
			require("../../mixin/coutdownAnimation"),
			require("../../mixin/themeDialog"),
			require("../../mixin/lyricEditorTimerUtil"),
			require("../../mixin/readingAsBgAudio"),
			require("../../mixin/readingLrcFile")
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
			current_player_lyric_line_index: 0,
			lyric_orbit_item_array: [],
			orbit_bd_rect: null,
			controller_button_x: 0,
			current_orbit_line_index: 0,
			scale_controller_btn: false,
			player_current_time: 0,
			player_current_time_text: "",
			player_duration_text: "",
			preview_audio_player: null,
			preview_audio_player_status:
				0/* 0 等待播放；1 正在播放；2 播放暂停；3 播放结束 */
		},
		onShow () {
			this.setData(
				{orbit_bd_rect: new WxBoundingRect("#orbit-bar")}
			);
		},
		onLoad () {
			const has_temp_lyric_lines = getApp().globalData.temp_lyric_lines instanceof LyricLines;
			const has_temp_lyric_time_lines = getApp().globalData.temp_lyric_time_lines instanceof LyricTimeLines;
			if (has_temp_lyric_lines) {
				this.showLoadingToast();
				let lyric_lines = getApp().globalData.temp_lyric_lines;
				this.setData(
					{
						lyrics: lyric_lines.getLyricLines()
					}
				);
			}
			if (has_temp_lyric_time_lines) {
				let lyric_time_lines = getApp().globalData.temp_lyric_time_lines;
				console.log(
					lyric_time_lines.getMap(),
					lyric_time_lines.getEveryLyricDurationMap()
				);
				this.setData(
					{
						lyric_orbit_item_array: lyric_time_lines.getEveryLyricDurationMap(),
						player_duration_text: fecha.format(new Date(lyric_time_lines.getLyricTotalDuration()), STOP_WATCH_MASK)
					}
				);
			}
		},
		// actoin-recording-lyric
		bindCurrentActionContainerChange (event) {
			console.log('swiper change->', event)
			const {current, source} = event.detail;
			source === "touch" && this.setData(
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
				wx_bg_audio_player && wx_bg_audio_player.pause(that);
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
			wx_bg_audio_player && wx_bg_audio_player.pause(this);
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
				`${inf.inputName || this.data.bg_audio_player?.audio_full_file_name || inf.placeholderName /* temp_lyric_lines_inf.songName || this.data.audio_full_file_name */}` +
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
							text: "删除",
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
			if (wx_bg_audio_player) {
				wx_bg_audio_player.stop(this);
			}
			this.setData(
				{
					recording_status: 0,
					current_recording_line_idx: 0,
					current_line_idx: 0,
					// lyric_line_stamps: []
				}
			);
			wx.nextTick(
				() => {
					typeof callback === "function" && callback();
				}
			);
		},
		switchLyricPlayer () {
			let that = this;
			let lyric_time_lines = 
			getApp().globalData.temp_lyric_time_lines = 
				new LyricTimeLines(
					this.data.lyrics,
					this.data.lyric_line_stamps
				)
			;
			this.resetLyricEditor(
				() => {
					that.setData(
						{
							lyric_orbit_item_array: lyric_time_lines.getEveryLyricDurationMap(),
							player_duration_text: 
								fecha.format(new Date(lyric_time_lines.getLyricTotalDuration()), STOP_WATCH_MASK),
							swiper_current_index: 1,
							player_current_time_text: "00:00"
						}
					);
				}
			);
		},
		makeLyricTimeFileText () {
			// let temp_arr = [];
			// for (let text of this.data.lyrics.filter(item => item !== '___PRE_LINE___')) {
			// 	temp_arr.push(
			// 		{text, time: this.data.lyric_line_stamps[temp_arr.length]}
			// 	);
			// }
			// console.log(temp_arr);
			let lyric_time_lines = new LyricTimeLines(
				this.data.lyrics, this.data.lyric_line_stamps
			);
			console.log(
				lyric_time_lines.getMap()
			);
		},
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
				// ===
				that.setData(
					{
						preview_audio_player: that.makeWxPreviewAudioPlayer(tempFile),
					}
				);
				console.log("playing music:", tempFile);
			})
			.catch(err => {
				if ("err_msg" in err) 
					that.showTextToast({msg: err.err_msg, time: 5000});
				console.log(err);
			})
		},
		// action-music-lyric-player
		bindTouchSwiping (event) {
			this.getBdWidth(".action-container");
			// this.animation.opacity().step();
			const {dx} = event.detail;
			console.log(dx)
		},
		forbidTouchMove () {},
		handleControllerBtnMove (event) {
			const lyric_total_duration = getApp().globalData.temp_lyric_time_lines.getLyricTotalDuration();
			const {x, source} = event.detail;
			if (x >= this.data.orbit_bd_rect.width) {
				getApp().globalData.wx_preview_audio_player.stop(this);
			}

			const current_progress = lyric_total_duration * x / this.data.orbit_bd_rect.width;

			let idx = findCurrentProgressIndexOfOribit(this.data.lyric_orbit_item_array, current_progress);
			let player_current_time_text = fecha.format(new Date(current_progress), STOP_WATCH_MASK);
			player_current_time_text !== this.data.player_current_time_text
			&& this.setData(
				{
					player_current_time: current_progress,
					player_current_time_text

				}
			);
			if (this.data.current_orbit_line_index !== idx) {
				this.setData({current_orbit_line_index: idx});
			}
		},
		// scaleOutSlideButton () {
		// 	this.data.scale_controller_btn || this.setData(
		// 		{scale_controller_btn: true}
		// 	);
		// },
		updateOrbitButtonXPosition (event) {
			if (this.data.lyric_orbit_item_array.length === 0) return;
			const [{pageX}] = event.touches;
			const {offsetLeft} = event.currentTarget;
			this.setData(
				{controller_button_x: pageX - offsetLeft - 10}
			);
		},
		// handleControllerButtonTouchEnd () {
		// 	this.setData(
		// 		{scale_controller_btn: false}
		// 	);
		// }
		makeWxPreviewAudioPlayer (tempFile) {
			let wx_preview_audio_player = 
				getApp().globalData.wx_bg_audio_player = 
				new WxBgAudioPlayer(tempFile)
			;
			wx_preview_audio_player.setDurationTimeTextDataKeyName(
				"player_duration_text"
			);
			wx_preview_audio_player.setPlayerStatusCodeDataKeyName(
				"preview_audio_player_status"
			);
			return wx_preview_audio_player;
		},
		toImportLyricFile () {
			this.openDialog(
				{
					title: "导入歌词文件",
					content: "暂时支持的类型歌词文件:\n.lrc",
					btn: [
						{
							text: "取消",
							type: "default"
						},
						{
							text: "消息文件",
							type: "primary",
							tap_event_name: "useImportedLyricFile"
						},
						{
							text: "缓存的文件",
							type: "primary",
							tap_event_name: ""
						}
					]
				}
			);
		},
		useImportedLyricFile () {
			let that = this;
			this.chooseLyricFile()
			.then(({data}) => {
				let lyric_time_lines = LyricTimeLines.parseLrcFileStringContent(data);
				if (lyric_time_lines) {
					getApp().globalData.temp_lyric_time_lines = lyric_time_lines;
					that.resetLyricEditor(
						() => {
							that.setData(
								{
									lyric_orbit_item_array: lyric_time_lines.getEveryLyricDurationMap(),
									player_duration_text: 
										fecha.format(new Date(lyric_time_lines.getLyricTotalDuration()), STOP_WATCH_MASK),
										player_current_time_text: "00:00"
								}
							);
						}
					);
				} else {
					that.showWarningToast({mag: "导入文件文本格式有误"});
				}
			})
			.catch(err => {
				if ("err_msg" in err) 
					that.showTextToast({msg: err.err_msg, time: 5000});
				console.error(err);
			})
		},
		toChooseMessagePreviewAudio () {
			let that = this;
			if (this.data.preview_audio_player_status === 0) {
				this.chooseMessageFileAsBgAudio()
				.then(res => {
					const {tempFiles: [tempFile]} = res;
					that.setData(
						{
							preview_audio_player: that.makeWxPreviewAudioPlayer(tempFile),
						}
					);
				})
				.catch(err => {
					if ("err_msg" in err) 
						that.showTextToast({msg: err.err_msg, time: 5000});
					console.log(err);
				})
			} else if (this.data.preview_audio_player_status === 1) {
				that.data.wx_preview_audio_player.pause(this);
			} else if (this.data.preview_audio_player_status === 2) {
				that.data.wx_preview_audio_player.continuePlay(this);
			}
		},
		controllerPlay () {
			let that = this;
			const lyric_total_duration = getApp().globalData.temp_lyric_time_lines?.getLyricTotalDuration() || [];
			if (lyric_total_duration.length === 0) {
				return this.showTextToast({msg: "没有可播放的歌词文件"});
			} 
			if (this.data.preview_audio_player) {
				this.data.preview_audio_player.startPlay(
					this, 
					null,
					(currentTime) => {
						return (
							{
								// player_current_time_text: fecha.format(new Date(currentTime * 1000), EXACT_STOP_WATCH_MASK),

								controller_button_x: currentTime / lyric_total_duration * 1000 * that.data.orbit_bd_rect.width
							}
						)
					}
				);
			} else {
				this.showTextToast(
					{msg: "没有可播放的音频文件"}
				);
			}
		},
		controllerPause () {
			let wx_preview_audio_player = getApp().globalData.wx_bg_audio_player;
			wx_preview_audio_player && wx_preview_audio_player.pause(this);
			this.setData(
				{preview_audio_player_status: 2}
			);
		}
	}
);

function findCurrentProgressIndexOfOribit (orbit_arr=[], current_progress=0) {
	let idx = 0;
	let len = 0;
	for (let {duration} of orbit_arr) {
		if (len > current_progress) break;
		len += duration;
		idx ++;
	}
	return idx-1;
}