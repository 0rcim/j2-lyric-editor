module.exports = {
	data: {
		hide_warn_toast: true,
		warn_toast: false,
		warn_timer: null,
		warn_msg: "",
		// === //
		hide_loading_toast: false,
		loading_toast: false,
		loading_msg: ""
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
	}
}