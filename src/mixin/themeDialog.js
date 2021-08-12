module.exports = {
	data: {
		is_dialog_open: false,
		dialog_title: "",
		dialog_bd_content: "",
		shade_close: true,
		dialog_btn_group: [
			{
				dialog_btn_type: "default",
				tap_event_name: "__close_dialog__"
			}
		]
	},
	openDialog ({title="", content="", shadeClose=true, btn}) {
		this.setData(
			Object.assign(
				{},
				{
					is_dialog_open: true,
					dialog_title: title,
					dialog_bd_content: content,
					shade_close: shadeClose
				},
				btn ? {dialog_btn_group: btn} : undefined
			)
		);
	},
	bindDailogBtnTap (event) {
		let that = this;
		const {idx, tapEventName="__close_dialog__", ...rest_data_set} = event.currentTarget.dataset;
		console.log(event, idx)
		if (typeof this[tapEventName] === "function") {
			this.setData(
				{is_dialog_open: false}
			);
			wx.nextTick(() => {
				that[tapEventName]({currentTarget: {dataset: rest_data_set}});
			});
		}
	},
	bindTapDialogShade () {
		this.data.shade_close &&
		this.setData(
			{is_dialog_open: false}
		);
	},
	__close_dialog__ () {
		this.setData(
			{is_dialog_open: false}
		);
	}
}