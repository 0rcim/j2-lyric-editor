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
	}
}