import fecha from "../plugins/fecha";
import {STOP_WATCH_MASK} from "../libs/fecha.mask";

export default class WxBgAudioPlayer {
	audio_ctx = null;
	audio_full_file_name;
	round_progress_bg_img_data_key;
	duration_time_data_key;
	// ===
	upd_progress_timer;
	constructor ({name="", path, size, time, type}) {
		this.audio_ctx = wx.createInnerAudioContext({useWebAudioImplement: false});
		this.audio_ctx.src = path;
		this.audio_full_file_name = name;
	};
	startPlay (page_this, on_end_callback) {
		let that = this;
		this.audio_ctx.play();
		if (this.round_progress_bg_img_data_key) {
			this.upd_progress_timer = setInterval(
				() => {
					page_this.setData(
						Object.assign(
							{},
							{
								[that.round_progress_bg_img_data_key]: 
								that.getRoundProgressBackgroundImage(that.audio_ctx.currentTime, that.audio_ctx.duration)
							},
							that.duration_time_data_key && that.audio_ctx.duration > 0
								? {[that.duration_time_data_key]: ' / ' + fecha.format(new Date(that.audio_ctx.duration * 1000), STOP_WATCH_MASK)}
								: undefined
						)
					);
				},
				250
			);
			this.audio_ctx.onEnded(
				() => {
					page_this.setData(
						{
							[that.round_progress_bg_img_data_key]: that.getRoundProgressBackgroundImage(that.audio_ctx.duration, that.audio_ctx.duration)
						}
					);
					typeof on_end_callback === "function" && on_end_callback();
					clearInterval(that.upd_progress_timer);
				}
			);
		}
		if (this.duration_time_data_key) {
			this.audio_ctx.onCanplay(
				() => {
					page_this.setData(
						{
							[that.duration_time_data_key]: 
							' / ' + fecha.format(new Date(that.audio_ctx.duration * 1000), STOP_WATCH_MASK)
						}
					);
				}
			);
		}
	};
	continuePlay (page_this) {
		let that = this;
		this.audio_ctx.play();
		clearInterval(this.upd_progress_timer);
		this.upd_progress_timer = setInterval(
			() => {
				page_this.setData(
					{
						[that.round_progress_bg_img_data_key]: 
						that.getRoundProgressBackgroundImage(that.audio_ctx.currentTime, that.audio_ctx.duration)
					}
				);
			},
			250
		);
	};
	pause (page_this) {
		clearInterval(
			this.upd_progress_timer
		);
		this.audio_ctx.pause();
	};
	stop (page_this) {
		let that = this;
		clearInterval(
			this.upd_progress_timer
		);
		this.audio_ctx.stop();
		if (that.round_progress_bg_img_data_key) {
			page_this.setData(
				{
					[that.round_progress_bg_img_data_key]: 
					that.getRoundProgressBackgroundImage(0, that.audio_ctx.duration)
				}
			);
		}
	};
	onTimeUpdate (callback) {
		this.audio_ctx.onTimeUpdate(callback);
	};
	setRoundProgressBgImgDataKeyName (key_name) {
		this.round_progress_bg_img_data_key = key_name;
	};
	setDurationTimeTextDataKeyName (key_name) {
		this.duration_time_data_key = key_name;
	};
	getRoundProgressBackgroundImage (currentTime=0, duration=0) {
		return (
			'background-image:url(' +
			'data:image/svg+xml,' +
			escape(
				'<svg width="64" height="64" fill="none" stroke-linecap="round" stroke-width="2" stroke="green" xmlns="http://www.w3.org/2000/svg" stroke-dasharray="' +
				((currentTime / duration || /*if NaN */ 0) * 64 * Math.PI) + 
				' 1000">' + 
					'<circle cx="-32" cy="32" r="31" transform="rotate(-90)"/>' + 
				'</svg>'
			) +
			')'
		);
	}
}