module.exports = {
	chooseMessageFile () {
		return new Promise((resolve, reject) => {
			wx.chooseMessageFile(
				{
					count: 1,
					type: "file",
					extension: ["txt", "lrc"],
					success (res) {
						resolve(res);
					},
					fail (err) {
						reject(err);
					}
				}
			);
		});
	}
}