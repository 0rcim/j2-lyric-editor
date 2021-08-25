module.exports = {
	data: {
		is_action_sheet_show: false,
		action_sheet_title: "",
		shadeClose: true,
		action_menu_list: []
	},
	openActionSheet ({title="", shadeClose=true, menu_list}) {
		this.setData(
			Object.assign(
				{},
				{
					is_action_sheet_show: true,
					action_sheet_title: title,
					shade_close: shadeClose
				},
				menu_list ? {action_menu_list: menu_list} : undefined
			)
		);
	},
	bindActionSheetTap (event) {
		let that = this;
		const {idx, tapEventName="__close_action_sheet__", ...rest_data_set} = event.currentTarget.dataset;
		if (typeof this[tapEventName] === "function") {
			this.setData(
				{is_action_sheet_show: false}
			);
			wx.nextTick(() => {
				that[tapEventName](event)
			});
		}
	},
	bindTapActionSheetShade () {
		this.data.shadeClose &&
		this.setData(
			{is_action_sheet_show: false}
		);
	},
	__close_action_sheet__ () {
		this.setData(
			{is_action_sheet_show: false}
		);
	}
}