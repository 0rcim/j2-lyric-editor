module.exports = {
	navigateTo (event) {
		const {path: page_path, params='{}'} = event.currentTarget.dataset;
		let search_str = Object.entries((JSON.parse(params))).map(([key, value]) => `${key}=${value}`);
		wx.navigateTo(
			{url: `${page_path}?${search_str.join("&")}`}
		);
	}
}