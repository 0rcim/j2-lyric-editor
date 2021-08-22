import LyricTimeLines from "./LyricTimeLines";
import WxBgAudioPlayer from "./WxBgAudioPlayer";

export default class LyricPlayer extends WxBgAudioPlayer {
	/**
	 * 
	 * @param {LyricTimeLines} lyric_time_lines 
	 */
	constructor (lyric_time_lines) {
		super(lyric_time_lines);
		this.audio_ctx = new LyricContextPolyFill(lyric_time_lines);
	};
};

class LyricContextPolyFill {
	duration = 0;
	currentTime = 0;
	timer;
	INTERVAL_MS = 100;
	__on_can_play;
	__on_ended;
	/**
	 * 
	 * @param {LyricTimeLines} lyric_time_lines 
	 */
	constructor (lyric_time_lines) {
		this.duration = lyric_time_lines.getLyricTotalDuration() / 1000;
	};
	destroy () {};
	seek (p=0) {
		this.currentTime = p;
	};
	play () {
		clearInterval(this.timer);
		this.onTimeUpdate();
		this.timer = setInterval(
			this.onTimeUpdate.bind(this),
			this.INTERVAL_MS
		);
	};
	onEnded (callback) {
		this.__on_ended = callback;
	};
	onCanplay (callback) {
		if (typeof callback === "function")
			this.__on_can_play = callback;
	};
	pause () {
		clearInterval(this.timer);
	};
	stop () {
		clearInterval(this.timer);
		this.currentTime = 0;
	};
	onTimeUpdate (callback) {
		this.currentTime += this.INTERVAL_MS / 1000;
		// this.currentTime = this.duration;
		if (this.currentTime >= this.duration) {
			this.currentTime = this.duration;
			wx.nextTick(
				() => {
					clearInterval(this.timer);
					console.log("timer clear")
					typeof this.__on_ended && this.__on_ended();
				}
			);
			console.log("...END...")
			// this.stop();
		}
		// typeof callback === "function" && callback();
	};
}