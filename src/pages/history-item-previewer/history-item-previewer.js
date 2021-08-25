import fecha from "../../plugins/fecha";
import { PL, EL } from "../../libs/LyricLines.const";


import {DEFAULT_LRC_TAG_TIME} from "../../libs/fecha.mask";

Page(
	{
		mixins: [
			require("../../mixin/themeChanged"),
			require("../../mixin/readingClipboardData")
		],
		data: {
			activated_data_type: 0,
			raw_data: {},
			inf: {}
		},
		onLoad () {
			const {temp_history_item} = getApp().globalData;
			const {
				name, birth_time, audio_name, 
				audio_duration, lyric_time_lines,
				__ID__
			} = temp_history_item;
			this.setData(
				{
					raw_data: JSON.parse(JSON.stringify(temp_history_item)),
					inf:
					{
						name, 
						birth_time_text: fecha.format(new Date(birth_time), "YYYY-MM-DD HH:mm:ss"),
						data_type_txt: lyric_time_lines.map(({text, time}) => (text === PL || text === EL ? " " : text) || " " ),
						data_type_lrc: 
							lyric_time_lines.map(
								({text, time}) => `[${fecha.format(new Date(time), DEFAULT_LRC_TAG_TIME)}]${(text === PL || text === EL ? " " : text) || " "}`
							),
						data_type_json:
							JSON.stringify(lyric_time_lines)
					}
				}
			);
			getApp().globalData.temp_history_item = null;
			/* --- */
		},
		switchDataType (event) {
			const {type} = event.currentTarget.dataset;
			this.setData(
				{activated_data_type: type}
			);
		},
		setCurrentTextToClipboard () {
			const {activated_data_type} = this.data;
			const {data_type_txt, data_type_lrc, data_type_json} = this.data.inf;
			this.setClipboardData(
				activated_data_type === 0
				? data_type_txt.join("\n")
				: activated_data_type === 1
					? data_type_lrc.join("\n")
					: activated_data_type === 2
						? data_type_json
						: undefined
			)
			.then(f => {
				console.log(f);
			})
			.catch(err => {
				console.error(err);
			});
		}
	}
);