module.exports = {
	data: {
		theme: "",
		theme_color: "",
		theme_bg: "",
		theme_fg: "",
		theme_sub_fg: "",
		theme_status: "",
		theme_status_: "",
		/* --- */
		themeColors: {
			light: {
				theme: "light",
				theme_color: "#11c95b",
				theme_bg: "#ededed",
				theme_fg: "#171717",
				theme_sub_fg: "#767676",
				theme_status: "#000000",
				theme_status_: "#ffffff",
			},
			dark: {
				theme: "dark",
				theme_color: "#169436",
				theme_bg: "#111111",
				theme_fg: "#cfcfcf",
				theme_sub_fg: "#868686",
				theme_status: "#ffffff",
				theme_status_: "#000000",
			}
		}
	},
	themeChanged(theme) {
		const theme_obj = this.data.themeColors[theme];
		this.setData(theme_obj);
		wx.setNavigationBarColor(
			{
				frontColor: theme_obj.theme_status,
				backgroundColor: theme_obj.theme_bg
			}
		);
	},
	onLoad() {
		const app = getApp();
		this.themeChanged(app.globalData.theme);
		app.watchThemeChange(this.themeChanged);
	},
	onShow() {
		this.themeChanged(getApp().globalData.theme);
	},
	onUnload() {
		getApp().unWatchThemeChange(this.themeChanged);
	},
};