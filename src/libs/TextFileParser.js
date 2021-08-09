export default class TextFileParser {
	origin_text = "";
	constructor (text = "") {
		this.origin_text = text;
	};
	getOriginText () {
		return this.origin_text;
	};
	getParsedLine () {
		return this.origin_text.split(/$/m).map(line => line.replace(/^\s+/, ""));
	}
}