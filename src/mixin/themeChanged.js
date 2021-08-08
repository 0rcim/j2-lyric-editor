module.exports = {
	data: {
		theme: '',
	},
	themeChanged(theme) {
		this.setData({
			theme,
		});
		wx.setNavigationBarColor(
			{
				frontColor: theme === "dark" ? "#ffffff" : "#000000",
				backgroundColor: theme === "dark" ? "#111111" : "#ededed",
			}
		);
	},
	onLoad() {
		const app = getApp();
		this.themeChanged(app.globalData.theme);
		app.watchThemeChange(this.themeChanged);
	},
	onUnload() {
		getApp().unWatchThemeChange(this.themeChanged);
	},
};