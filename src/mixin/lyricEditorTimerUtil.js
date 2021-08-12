import fecha from "../plugins/fecha";
import {STOP_WATCH_MASK} from "../libs/fecha.mask";

module.exports = {
	data: {
		start_time_stamp: 0,
		origin_start_time_stamp: 0,
		pause_time_stamp: 0,
		gap_time: 0,
		editor_stopwatch_text: "00:00",
		stop_watch_timer: null
	},
	init_lrc_timer (next_tick_callback) {
		let now = Date.now();
		this.setData(
			{
				start_time_stamp: now, 
				pause_time_stamp: now,
				origin_start_time_stamp: now,
				gap_time: 0,
				editor_stopwatch_text: "00:00",
				end_lyric_line_time: 0
			}
		);
		wx.nextTick(
			() => {
				typeof next_tick_callback === "function" && next_tick_callback()
			}
		);
	},
	startStopWatch () {
		let that = this;
		let gap = Date.now() - this.data.pause_time_stamp;
		// debugger;
		this.setData(
			{gap_time: that.data.gap_time + gap}
		);
		clearInterval(that.data.stop_watch_timer);
		console.log("gap->", gap);
		let timer = setInterval(
			() => {
				let t = Date.now() - that.data.origin_start_time_stamp - that.data.gap_time;
				// debugger;
				that.setData(
					{
						editor_stopwatch_text:
						fecha.format(
							new Date(t),
							STOP_WATCH_MASK
						)
					}
				);
			},
			10
		);
		console.log("set stop watch timer->", timer);
		this.setData(
			{stop_watch_timer: timer}
		);
	},
	getTime () {
		return Date.now() - this.data.origin_start_time_stamp - this.data.gap_time;
	},
	pauseStopWatch (callback) {
		clearInterval(
			this.data.stop_watch_timer
		);
		console.log("clear stop watch timer->", this.data.stop_watch_timer);
		this.setData(
			{pause_time_stamp: Date.now()}
		);
		wx.nextTick(() => {
			typeof callback === "function" && callback();
		});
	},
	endStopWatch (callback) {
		clearInterval(
			this.data.stop_watch_timer
		);
		console.log("clear stop watch timer->", this.data.stop_watch_timer);
		wx.nextTick(() => {
			typeof callback === "function" && callback();
		});
	}
}