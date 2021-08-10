module.exports = {
	data: {
		warn_toast: false,
		warn_timer: null,
		warn_msg: "",
		// === //
		loading_toast: false,
		loading_msg: "",
		// === //
		text_toast: false,
		text_timer: null,
		text_toast_msg: ""
	},
	showWarningToast ({ time=3000, msg="" }) {
		var that = this;
		this.setData({warn_toast: true, warn_msg: msg});
		this.data.warn_timer = setTimeout(() => {
			that.setData({warn_toast: false});
			clearTimeout(that.data.warn_timer);
		}, time);
	},
	showLoadingToast (msg="加载中") {
		this.setData({loading_toast: true, loading_msg: msg});
	},
	hideLoadingToast () {
		this.setData({loading_toast: false});
	},
	showTextToast ({ time=3000, msg="" }) {
		var that = this;
		this.setData({text_toast: true, text_toast_msg: msg});
		this.data.text_timer = setTimeout(() => {
			that.setData({text_toast: false});
			clearTimeout(that.data.text_timer);
		}, time);
	}
}