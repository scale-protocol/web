// import Vue from 'vue'
function formatPubKey(account) {
	return account ? account.substr(0, 4) + '...' + account.substr(-4, 4) : ''
}

const filters = {
	formatPubKey
}

const install = function (Vue) {
	Object.keys(filters).forEach(key => {
		Vue.filter(key, filters[key])
	})
}

if (typeof window !== undefined && window.Vue) {
	install(window.Vue)
}

export default Object.assign(filters, { install })