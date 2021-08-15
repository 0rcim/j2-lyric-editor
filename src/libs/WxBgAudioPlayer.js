import fecha from "../plugins/fecha";
import {STOP_WATCH_MASK} from "../libs/fecha.mask";

export default class WxBgAudioPlayer {
	audio_ctx = null;
	audio_full_file_name;
	round_progress_bg_img_data_key;
	duration_time_data_key;
	player_status_code_data_key;
	// ===
	upd_progress_timer;
	constructor ({name="", path, size, time, type}) {
		this.audio_ctx = wx.createInnerAudioContext({useWebAudioImplement: false});
		this.audio_ctx.src = path;
		this.audio_full_file_name = name;
	};
	destroy () {
		this.audio_ctx.destroy();
	};

	startPlay (page_this, on_end_callback, every_tick_etx_data) {
		let that = this;
		this.audio_ctx.play();
		this.upd_progress_timer = setInterval(
			() => {
				page_this.setData(
					Object.assign(
						{},
						typeof every_tick_etx_data === "function" 
						? every_tick_etx_data(that.audio_ctx.currentTime) 
						: undefined,
						that.round_progress_bg_img_data_key
						?
						{
							[that.round_progress_bg_img_data_key]: 
							that.getRoundProgressBackgroundImage(that.audio_ctx.currentTime, that.audio_ctx.duration)
						}
						: undefined,
						that.duration_time_data_key && that.audio_ctx.duration > 0
							? {[that.duration_time_data_key]: ' / ' + fecha.format(new Date((that.audio_ctx.duration) * 1000), STOP_WATCH_MASK)}
							: undefined,
						that.player_status_code_data_key && page_this.data[that.player_status_code_data_key] !== 1 
							? {[that.player_status_code_data_key]: 1}
							: undefined
					)
				);
			},
			250
		);
		this.audio_ctx.onEnded(
			() => {
				page_this.setData(
					Object.assign(
						{
							[that.player_status_code_data_key]: 3
						},
						that.round_progress_bg_img_data_key
						? 
						{
							[that.round_progress_bg_img_data_key]: that.getRoundProgressBackgroundImage(that.audio_ctx.duration, that.audio_ctx.duration),
						}
						: undefined
					)
				);
				typeof on_end_callback === "function" && on_end_callback();
				clearInterval(that.upd_progress_timer);
			}
		);
		if (this.duration_time_data_key) {
			this.audio_ctx.onCanplay(
				() => {
					page_this.setData(
						{
							[that.duration_time_data_key]: 
							' / ' + fecha.format(new Date(that.audio_ctx.duration * 1000), STOP_WATCH_MASK),
							[that.player_status_code_data_key]: 0
						}
					);
				}
			);
		}
	};
	continuePlay (page_this) {
		if(page_this.data[this.player_status_code_data_key] === 0) return;
		let that = this;
		this.audio_ctx.play();
		clearInterval(this.upd_progress_timer);
		this.upd_progress_timer = setInterval(
			() => {
				page_this.setData(
					{
						[that.round_progress_bg_img_data_key]: 
						that.getRoundProgressBackgroundImage(that.audio_ctx.currentTime, that.audio_ctx.duration),
						[that.player_status_code_data_key]: 0
					}
				);
			},
			250
		);
	};
	pause (page_this) {
		let that = this;
		clearInterval(
			this.upd_progress_timer
		);
		page_this.setData(
			{
				[that.player_status_code_data_key]: 2
			}
		);
		wx.nextTick(
			() => {
				that.audio_ctx.pause();
			}
		);
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
					that.getRoundProgressBackgroundImage(0, that.audio_ctx.duration),
					[that.player_status_code_data_key]: 3
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
	setPlayerStatusCodeDataKeyName (key_name) {/* status code: 0 等待播放；1 正在播放；2 播放暂停；3 播放结束 */
		this.player_status_code_data_key = key_name;
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
	};
}