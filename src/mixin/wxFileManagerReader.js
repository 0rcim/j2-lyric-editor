module.exports = {
	data: {

	},
	onLoad () {
		let fsm = getApp().globalData.fsm = wx.getFileSystemManager();
		fsm.readdir(
			{
				dirPath: `${wx.env.USER_DATA_PATH}`,
				success (res) {
					console.log(res);
				}
			}
		);
	},

}