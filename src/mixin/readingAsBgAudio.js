module.exports = {
	chooseMessageFileAsBgAudio () {
		const valid_ext = ["flac", "mp3", "ogg", "aac", "m4a", "amr"];
		return new Promise((resolve, reject) => {
			wx.chooseMessageFile(
				{
					count: 1,
					type: "file",
					extension: valid_ext,
					success (res) {
						resolve(res);
					},
					fail (err) {
						reject(err);
					}
				}
			);
		})
		.then(res => {
			if (res.errMsg === "chooseMessageFile:ok") {
				const {tempFiles: [{name, path, size, time}]} = res;
				const file_ext = name.replace(/^[\s\S]+\.(\w+?)$/, "$1");
				if (valid_ext.includes(file_ext)) {
					return Promise.resolve(res);
				} else {
					return Promise.reject({err_msg: `暂时支持的音频类型：${valid_ext.join(",")}`})
				}
			}
		})
	}
}