const { wx_storage } = getApp().globalData;

wx_storage.getInfo()
.then(res => {
	console.log(res)
});

Page(
	{
		mixins: [require("../../mixin/themeChanged")],
		data: {
			storage_usage_info_text: "",
			isDarkModeEnabled: false,
			loading: false
		},
		onShow () {
			this.refreshStorageUsageInfo();
		},
		refreshStorageUsageInfo () {
			wx_storage.getInfo()
			.then(({percent_text}) => {
				this.setData(
					{storage_usage_info_text: percent_text}
				);
			})
			.catch(err => {
				console.error(err);
			});
		},
		onLoad () {
			this.setData(
				{isDarkModeEnabled: getApp().globalData.theme === "dark"}
			);
		},
		bindThemeChange (event) {
			const enableDarkMode = event.detail.value.indexOf("enable-dark-mode") !== -1;
			const valTheme = enableDarkMode ? "dark" : "light";
			this.setStorage(
				"settings.theme", 
				valTheme,
				() => {
					getApp().themeChanged(valTheme)
				}
			);
			this.setData(
				{isDarkModeEnabled: enableDarkMode}
			);
		},
		setStorage (key_path, value, callback) {
			this.setData({loading: true});
			wx_storage.set(key_path, value)
			.then(() => {
				this.setData({loading: false});
				this.refreshStorageUsageInfo();
				typeof callback === "function" && callback();
			})
			.catch(err => {
				this.setData({loading: false});
				console.error(err);
			})
		}
	}
);