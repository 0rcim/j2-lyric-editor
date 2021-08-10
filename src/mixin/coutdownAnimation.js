module.exports = {
	data: {
		total_count: 0,
		current_count: -1,
		endCallbackFnName: "",
		countdown_layer_showing: false
	},
	playCountdownAnimate (event) {
		let that = this;
		const {countdownNum, endCallbackFnName} = event.currentTarget.dataset;
		this.setData(
			{
				total_count: countdownNum + 1,
				current_count: countdownNum,
				endCallbackFnName,
				countdown_layer_showing: true
			}
		);
		wx.nextTick(() => {
			that.attachAnimateToView.bind(that)();
		});
	},
	attachAnimateToView () {
		let that = this;
		this.animate(
			`#countdown-number-${that.data.current_count}`,
			[
				{scale: [1, 1], opacity: 1},
				{scale: [4, 4], opacity: 0}
			],
			1000,
			() => {
				if (that.data.current_count > 1) {
					that.setData({current_count: that.data.current_count - 1});
					wx.nextTick(() => {
						that.attachAnimateToView.bind(that)();
					})
				} else {
					this.setData(
						{countdown_layer_showing: false}
					);
					typeof that[that.data.endCallbackFnName] === "function" && that[that.data.endCallbackFnName]();
				}
			}
		);
	},
}