import LyricTimeLines from "./LyricTimeLines";

export default class WxAudioFragmentPlayer {
	web_audio_ctx = null;
	path = "";
	source = null;
	prev_source = null;
	constructor ({name="", path, size, time, type}) {
		this.web_audio_ctx = wx.createWebAudioContext();
		this.path = path;
	};
	/**
	 * 获取传入的时间节点数组，返回间隔内的AudioBuffer
	 * @param  {LyricTimeLines} lyric_time_lines 歌词时间对应表处理对象
	 * @returns {Promise}
	 */
	getAudioBufferParts (lyric_time_lines) {
		let that = this;
		return this.loadAudio()
		.then(buffer => {
			const {duration, numberOfChannels, sampleRate} = buffer;
			const map = lyric_time_lines.getEveryLyricDurationMap();
			// 
			const {duration: d, start_time: st} = map[map.length - 1];
			if (d === 0) map[map.length - 1].duration = duration * 1000 - st;
			// 
			const audio_buffer_part_arr = 
			map.map(({start_time, duration}) => {
				const start_offset = start_time / 1000 * sampleRate;
				const frame = duration / 1000 * sampleRate;
				const new_audio_buffer = that.web_audio_ctx.createBuffer(
					numberOfChannels,
					frame,
					sampleRate
				);
				const temp_32_arr = new Float32Array(frame);
				for (let i=0; i<numberOfChannels; i++) {
					buffer.copyFromChannel(temp_32_arr, i, start_offset);
					new_audio_buffer.copyToChannel(temp_32_arr, i, 0);
				}
				return new_audio_buffer;
			});
			return Promise.resolve(audio_buffer_part_arr);
		});
	};
	loadAudio () {
		let that = this;
		return new Promise((resolve, reject) => {
			wx.request(
				{
					url: that.path,
					responseType: "arraybuffer",
					success: resolve,
					fail: reject
				}
			);
		})
		.then(res => 
			res.errMsg === "request:ok" 
			? Promise.resolve(res) 
			: Promise.reject({err_msg: res.errMsg})
		)
		.then(res => 
			new Promise(
				(resolve, reject) => 
					that.web_audio_ctx.decodeAudioData(res.data, resolve, reject)
			)
		);
	};
	playFrag (buffer_parts, partId) {
		this.source = this.web_audio_ctx.createBufferSource();
		this.source.buffer = buffer_parts[partId];
		this.source.connect(this.web_audio_ctx.destination);
		this.prev_source && this.prev_source.stop();
		this.source.start();
		this.prev_source = this.source;
	}
}