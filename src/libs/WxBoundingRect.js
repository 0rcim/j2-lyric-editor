export default class WxBoundingRect {
	querySelector;
	boundingClientRect;
	width;
	left;
	constructor (node_selector) {
		let that = this;
		this.querySelector = wx.createSelectorQuery();
		this.querySelector.select(node_selector)
		.boundingClientRect(rect => {
			const {width} = that.boundingClientRect = rect;
			that.width = width;
		})
		.exec();
	};
}