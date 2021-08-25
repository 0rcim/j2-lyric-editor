export default class WxBoundingRect {
	querySelector;
	boundingClientRect;
	width;
	left;
	top;
	dataset;
	constructor (node_selector) {
		let that = this;
		this.querySelector = wx.createSelectorQuery();
		if (!node_selector) return;
		this.querySelector.select(node_selector)
		.boundingClientRect(rect => {
			const {width, top, dataset} = that.boundingClientRect = rect;
			that.width = width;
			that.top = top;
			that.dataset = dataset;
		})
		.exec();
	};
	getBoundingClientRect (node_selector, resolver) {
		return new Promise((resolve, reject) => {
			wx.createSelectorQuery().select(node_selector)
			.boundingClientRect(res => typeof resolver === "function" ? resolver(res, resolve) : resolve(res))
			.exec();
		});
	};
}