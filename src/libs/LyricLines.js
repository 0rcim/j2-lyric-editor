export default class LyricLines {
	lyric_group = [];
	inf = {};
	length = 0;
	constructor (lyric_group=[], inf={}) {
		this.lyric_group = lyric_group;
		this.length = lyric_group.length;
		this.inf = inf;
	};
	getLyricLines () {
		return this.lyric_group;
	}
}