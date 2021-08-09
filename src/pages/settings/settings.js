Page(
	{
		mixins: [require("../../mixin/themeChanged")],
		data: {
			isDarkModeEnabled: false
		},
		onLoad () {
			this.setData(
				{isDarkModeEnabled: getApp().globalData.theme === "dark"}
			);
		},
		bindThemeChange (event) {
			console.log(event)
			const enableDarkMode = event.detail.value.indexOf("enable-dark-mode") !== -1;
			getApp().themeChanged(
				enableDarkMode ? "dark" : "light"
			);
			this.setData(
				{isDarkModeEnabled: enableDarkMode}
			);
		}
	}
);