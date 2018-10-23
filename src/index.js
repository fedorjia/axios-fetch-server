const axios = require('axios')
// const qs = require('querystring')

let prefix = ''

const instance = axios.create({
	timeout: 6000,
	withCredentials: false,
	headers: {
		'Accept': 'application/json, text/plain, */*',
		'Content-Type': 'application/json'
		// 'Access-Control-Allow-Origin': '*'
	},

	// transformResponse: [function(data) {
	// 	return JSON.parse(data);
	// }],

	// validateStatus: function (status) {
	// 	return status >= 200 && status < 300
	// }
});

/**
 * interceptor for request
 */
instance.interceptors.request.use((config) => {
	return config;
}, (err) => {
	return Promise.reject(err);
});

/**
 * interceptor for response
 */
instance.interceptors.response.use((res) => {
	const data = res.data;
	if (data.status !== 22000) {
		return Promise.reject({status: data.status, body: data.body})
	}
	return data.body
}, (err) => {
	let errorMessage = err.message
	let status = -1
	if (err.response) {
		status = err.response.status
		switch (err.response.status) {
			case 404: {
				errorMessage = '404 not found'
				break
			}
			case 500: {
				errorMessage = '500 internal error'
				break
			}
		}
	}
	return Promise.reject({status: status, body: errorMessage})
});


module.exports = {

	setupRequestPrefix(proxy) {
		prefix = proxy
	},

	async raw(option) {
		return axios(option)
	},

	async request(option) {
		option.url = prefix + option.url
		return await instance(option)
	},

	async get(url, params = {}) {
		return this.request({method: 'get', url, params})
	},

	async post(url, params = {}) {
		return this.request({method: 'post', url, data: params}) // params
	},

	async put(url, params = {}) {
		return this.request({method: 'put', url, data: params})
	},

	async patch(url, params = {}) {
		return this.request({method: 'patch', url, data: params})
	},

	async delete(url, params = {}) {
		return this.request({method: 'delete', url, data: params})
	},

	async all(items) {
		if(!Array.isArray(items)) {
			if (typeof items !== 'object') {
				throw 'argument should be object or array.'
			}
			items = [items]
		}

		const task = []
		for(let item of items) {
			task.push(this.request(item))
		}
		return await axios.all(task)
	}
}
