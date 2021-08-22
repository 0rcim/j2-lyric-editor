import fecha from "../plugins/fecha";
import { EXACT_STOP_WATCH_MASK } from "./fecha.mask";
import { PL, EL } from "./LyricLines.const";

export default class LyricTimeLines {
	origin_lyric_arr;
	lyric_time_lines = [];
	lyric_duration = 0;
	constructor (lyric_arr=[], time_arr=[], time_offset=0) {
		this.lyric_duration = time_arr[time_arr.length - 1];
		this.lyric_time_lines = 
		[
			{text: PL, time: 0},
			...lyric_arr
			.filter(item => item !== PL && item !== EL)
			.map((item, index) => ({text: item, time: time_arr[index] + time_offset})),
			{text: EL, time: this.lyric_duration}
		]
		;
	};
	getMap () {
		return this.lyric_time_lines;
	};
	getEveryLyricDurationMap () {
		return this.getMap()
		.map(({time, text}, index, arr) => {
			return (
				{
					start_time: time,
					start_time_text: fecha.format(new Date(time), EXACT_STOP_WATCH_MASK),
					text: text,
					duration: (arr[index + 1]?.time - time) || 0
				}
			)
		})
	};
	getLyricTotalDuration () {
		return this.lyric_duration;
	};
	toLrcFileStringContent (time_tag_mask="mm:ss.SS") {
		return (
			[
				{time: 0, text: ""},
				...this.getMap(),
				{time: this.getLyricTotalDuration(), text: ""}
			]
		)
		.filter(({text}) => text !== PL && text !== EL)
		.map(({time, text}) =>
			["[", fecha.format(new Date(time), time_tag_mask), "]", text].join("")
		)
		.join("\n");
	};
	// ---
	static valid_line_match_source = "^\\[(\\d{2}:\\d{2}\\.\\d{2})\\]([\\s\\S]*?)$";
	static parseLrcFileStringContent (str="") {
		let source = LyricTimeLines.valid_line_match_source;
		const result = str.match(new RegExp(source, "mg"));
		if (!result) return;
		const m = new RegExp(source);
		const mask = "mm:ss.SS";
		const zero = fecha.parse("00:00.00", mask).valueOf();
		return new LyricTimeLines(
			result.map(line => line.match(m)[2]),
			result.map(line => fecha.parse(line.match(m)[1], mask).valueOf() - zero)
		);
	};
}