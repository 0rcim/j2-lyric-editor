import fecha from "../plugins/fecha";

export default class FavoriteStorageData {
	wx_storage;
	history_storage;
	/* ----- */

	constructor (wx_storage, history_storage) {
		this.wx_storage = wx_storage;
		this.history_storage = history_storage;
		
	};
	parseFavList (favorites_list=[[],[],[]]) {
		return new FavList(this.wx_storage, this.history_storage, favorites_list);
	};
	saveFav (history_id, fav_level=0) {
		return this.wx_storage.get("favorites")
		.then(fav_list => {
			const lv = getLevel(history_id, fav_list);
			if (lv > 0) {
				const index = fav_list[lv-1].indexOf(history_id);
				fav_list[lv-1].splice(index, 1);
			}
			if (fav_level > 0) {
				fav_list[fav_level-1].push(history_id);
			}
			return this.wx_storage.set(
				"favorites",
				fav_list
			);
		})
	}
}

class FavList {
	wx_storage;
	history_storage;
	/* ----- */
	favorites_list;
	constructor (wx_storage, history_storage, favorites_list) {
		this.wx_storage = wx_storage;
		this.history_storage = history_storage;
		this.favorites_list = favorites_list;
	};
	getLevel (history_id) {
		return getLevel(history_id, this.favorites_list);
	};
	get (history_id) {
		return this.wx_storage.get("history")
		.then(data => {
			const list = data.map(item => this.history_storage.parseItem(item));
			const [target] = list.filter(({__ID__}) => __ID__ === history_id);
			target.fav_level = this.getLevel(history_id);
			return Promise.resolve(target);
		})
	};
	getAll () {
		return this.wx_storage.get("history")
		.then(data => {
			const list = data.map(item => this.history_storage.parseItem(item));
			const res = this.favorites_list.map(lv_list => {
				const target = lv_list.map(
					history_id => {
						let t = list.filter(({__ID__}) => __ID__ === history_id)[0];
						t.birth_time_text = fecha.format(new Date(t.birth_time), "YYYY/MM/DD HH:mm:ss");
						return t;
					}
				)
				.filter(Boolean);
				return target;
			});
			return Promise.resolve(res);
		})
	}
}

function getLevel (history_id, favorites_list) {
	let lv = 0;
	for (let i=0; i<favorites_list.length; i++) {
		if (favorites_list[i].includes(history_id)) {
			lv = i + 1;
			break;
		}
	}
	return lv;
}