module.exports = {
	chooseLyricFile () {
		const valid_ext = ["lrc"];
		const MAX_FILE_SIZE = 60 * 1024; /* 60Kb */
		let fsm = wx.getFileSystemManager();
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
					return Promise.reject({err_msg: `暂时支持的文件类型：${valid_ext.join(",")}`})
				}
			}
		})
		.then(res => {
			const {tempFiles: [{name, path, size, time}]} = res;
			let err_msg;
			if (size > MAX_FILE_SIZE) {
				err_msg = "文件体积大于60Kb";
			} else if (!/\.lrc$/.test(name)) {
				err_msg = "仅支持lrc文件";
			}
			if (err_msg === undefined) {
				return new Promise((resolve, reject) => {
					fsm.readFile(
						{
							filePath: path,
							encoding: "utf-8",
							success: file_res => resolve(Object.assign({}, file_res, {name, path, size, time})),
							fail: reject
						}
					);
				});
			} else {
				return Promise.reject({err_msg});
			}
		})
		.then(res => {
			if (res.errMsg === "readFile:ok") {
				return Promise.resolve(res);
			} else {
				return Promise.reject({err_msg: "读取消息文件失败"});
			}
		});
	}
}