class Helpers {
	ci_comparer(a, b) {
		return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
	}
}

const helpers = new Helpers;

export default helpers;