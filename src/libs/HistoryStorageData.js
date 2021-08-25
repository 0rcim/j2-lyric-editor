import fecha from "../plugins/fecha";

export default class HistoryStorageData {
	/* ========= */
	static decode_key_map = 
	{
		"id": "__ID__",
		"a":
			"birth_time",
		"b":
			"audio_name",
		"c":
			"audio_duration",
		"d":
			"temp_audio_file_path",
		"e":
			"name",
		"f":
			"lyric_time_lines",
	}
	;
	static encode_key_map = 
		Object.fromEntries(
			Object.entries(HistoryStorageData.decode_key_map)
			.map(en => en.reverse())
		)
	;
	/* ========= */
	constructor () {

	};

	/** 创建历史已编辑/制作的歌词存储对象数据 */
	makeItem (obj={}) {
		let temp = {};
		let key_map = HistoryStorageData.encode_key_map;
		for (let key in obj) 
			if (key in key_map) temp[key_map[key]] = obj[key];
		return temp;
	};
	/** 解析历史已编辑/制作的歌词存储对象数据 */
	parseItem (obj={}) {
		let temp = {};
		let key_map = HistoryStorageData.decode_key_map;
		for (let key in obj)
			if (key in key_map) temp[key_map[key]] = obj[key];
		return temp;
	};
	/**
	 * 
	 * @param {HistoryStorageData} _thiz HistoryStorageData 的实例
	 * @param {Array} storage_history 本地存储的 history 列表数组
	 */
	static parseItemListGroupByMonth (_thiz, storage_history=[]) {
		if (storage_history.length === 0) return [];

		const now = new Date();
		const n_year = fecha.format(now, "YYYY");
		const n_month = fecha.format(now, "MM");
		const arr = storage_history.map(item => _thiz.parseItem(item));

		arr.sort((a, b) => b.birth_time - a.birth_time);

		let [{birth_time}] = arr;
		let f_birth_time_date = new Date(birth_time);
		let temp_year = fecha.format(f_birth_time_date, "YYYY"), 
			temp_month = fecha.format(f_birth_time_date, "MM");
		let temp_month_item = 
		{
			month_date: 
				fecha.format(
					f_birth_time_date,
					n_year === fecha.format(f_birth_time_date, "YYYY") 
						&& n_month === fecha.format(f_birth_time_date, "MM")
					? "MM月"
					: "YYYY-MM"
				)
			,
			list: []
		};
		let temp = [temp_month_item];
		for (let i=0; i<arr.length; i++) {
			let date = new Date(arr[i].birth_time);
			if (temp_year !== fecha.format(date, "YYYY") || temp_month !== fecha.format(date, "MM")) {
				temp_year = fecha.format(date, "YYYY");
				temp_month = fecha.format(date, "MM");
				temp.push(
					{
						month_date: fecha.format(date, temp_year === n_year ? "MM月" : "YYYY MM月"),
						list: []
					}
				);
			}
			temp[temp.length-1].list.push(
				{
					name: arr[i].name,
					id: arr[i].__ID__,
					birthtime: fecha.format(date, "YYYY-MM-DD HH:mm:ss")
				}
			)
		}
		return temp;
	}
}