module.exports = {
	readingClipboardData () {
		return new Promise((resolve, reject) => {
			wx.getClipboardData(
				{
					success: resolve,
					fail: reject
				}
			);
		});
	},
	setClipboardData (str) {
		if (!str) return Promise.reject({err_msg: "设置剪切板内容失败"});
		return new Promise((success, fail) => {
			wx.setClipboardData(
				{
					data: str,
					success,
					fail
				}
			);
		})
		;
	}
}