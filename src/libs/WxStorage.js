export default class WxStorage {
	/**
	 * @var {string} ROOT_KEY_NAME 根存储数据对象键名
	 */
	ROOT_KEY_NAME = "G";
	default_value = {
		settings: {
			theme: "light",
			/**
			 * pages/lyric-editor.data.
			 * never_open_confirm_use_background_audio_dialog
			 */ 
			NOCUBAD: false
		},
		history: []
	};
	constructor () {
		if (wx.getStorageInfoSync().keys.length === 0) { // 小程序首次运行
			wx.setStorageSync(this.ROOT_KEY_NAME, {});
		}
	};
	getInfo () {
		return wx.getStorageInfo()
		.then(res => {
			if (res.errMsg === "getStorageInfo:ok") {
				/**
				 * keys	Array.<string>	当前 storage 中所有的 key
				 * currentSize	number	当前占用的空间大小, 单位 KB
				 * limitSize	number	限制的空间大小，单位 KB
				 */
				const {currentSize, limitSize} = res;
				return Promise.resolve(
					{
						data: res,
						percent_text: `${kByteFormat(currentSize)} / ${kByteFormat(limitSize)}`
					}
				);
			} else {
				return Promise.reject({err_msg: errMsg})
			}
		})
	};
	getSync (path="") {
		/**
		 * @example path = obj.0.1.a.b.c
		 */
		return path.split(".").reduce((p, c) => p[c], Object.assign({}, this.default_value, wx.getStorageSync(this.ROOT_KEY_NAME)));
	};
	get (path) {
		let that = this;
		return wx.getStorage({key: this.ROOT_KEY_NAME})
		.then(res => {
			if (res.errMsg === "getStorage:ok") {
				return Promise.resolve(
					path.split(".").reduce((p, c) => p[c] || that.default_value[c], res.data)
				);
			} else {
				return Promise.reject({err_msg: errMsg});
			}
		})
	};
	set (path, data) {
		return wx.getStorage({key: this.ROOT_KEY_NAME})
		.then(res => {
			if (res.errMsg !== "getStorage:ok") return Promise.reject({err_msg: res.errMsg});
			return wx.setStorage(
				{
					key: this.ROOT_KEY_NAME, 
					data: 
						object_assign(
							res.data, 
							typeof path === "function" ? path(res.data) : path,
							typeof data === "function" ? data(res.data) : data
						)
				}
			)
			.then(res => {
				if (res.errMsg === "setStorage:ok") {
					return Promise.resolve(res);
				} else {
					return Promise.reject({err_msg: errMsg});
				}
			})
		});
	};
	clearAll () {
		return wx.clearStorage()
		.then(res => {
			if (res.errMsg === "clearStorage:ok") {
				return Promise.resolve(res);
			} else {
				return Promise.reject({err_msg: errMsg});
			}
		})
	};
}

function object_assign (source, target_key_string, target_value_data) {
	let temp = {};
	let list = target_key_string.split(".");
	const makeTemp = function (child, idx) {
		let temp_index = idx + 1;
		if (temp_index === list.length - 1) {
			child[list[temp_index]] = target_value_data;
		} else {
			child[list[temp_index]] = {};
			makeTemp(child[list[temp_index]], temp_index);
		}
	}
	makeTemp(temp, -1);
	const assign = function (child, source_child, idx) {
		let temp_index = idx + 1;
		for (let key in source_child) {
			if (key === list[temp_index] && typeof child[key] === "object") {
				if (child[key] instanceof Array) {
					// ...
				} else {
					assign(child[key], source_child[key], temp_index);
				}
			} else if (key === list[temp_index] && typeof child[key] !== "object") {
				child[key] = target_value_data;
			} else {
				child[key] = source_child[key];
			}
		}
	}
	assign(temp, source, -1);
	console.log("===>", temp)
	return temp;
}

function kByteFormat (kBytes=0, decimal=2) {
	const sizes = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	if (kBytes === 0) return "0 Kb";
	let x = 0, k =1024, kBytes_copy = kBytes;
	while (kBytes_copy >= k) {
		kBytes_copy /= k;
		x++;
	}
	return [
		parseFloat((kBytes / Math.pow(k, x)).toFixed(decimal)), 
		sizes[x]
	].join(" ");
};