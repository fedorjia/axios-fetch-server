const axios = require('axios')

class Fetch {
	constructor() {
		this.baseURL = ''
		this.extra = {}

		this.axiosInstance = axios.create({
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
	}

	addRequestInterceptor(func) {
		this.axiosInstance.interceptors.request.use(func)
	}

	addResponseInterceptor(func) {
		this.axiosInstance.interceptors.response.use(func)
	}

	/**
	 * default interceptor for request
	 */
	addDefaultRequestInterceptor() {
		this.axiosInstance.interceptors.request.use((config) => {
			config.headers = this.getRequestExtra()

			return config
		}, (err) => {
			return Promise.reject(err);
		});
	}

	/**
	 * default interceptor for response
	 */
	addDefaultResponseInterceptor() {
		this.axiosInstance.interceptors.response.use((res) => {
			const data = res.data;
			if (data.status !== 200) {
				return Promise.reject({status: data.status, body: null, message: data.body})
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
			return Promise.reject({status: status, body: null, message: errorMessage})
		});
	}

	setRequestBaseURL(baseURL) {
		this.baseURL = baseURL
	}

	getRequestBaseURL() {
		return this.baseURL
	}

	addRequestExtra(extra = {}) {
		if (extra.baseURL) {
			this.baseURL = extra.baseURL
			delete extra.baseURL
		}

		Object.assign(this.extra, extra)
	}

	getRequestExtra() {
		return this.extra
	}

	async raw(option) {
		return axios(option)
	}

	async request(option) {
		return await this.axiosInstance(this.baseURL + option.url)
	}

	async get(url, params = {}) {
		return this.request({method: 'get', url, params})
	}

	async post(url, params = {}) {
		return this.request({method: 'post', url, data: params}) // params
	}

	async put(url, params = {}) {
		return this.request({method: 'put', url, data: params})
	}

	async patch(url, params = {}) {
		return this.request({method: 'patch', url, data: params})
	}

	async delete(url, params = {}) {
		return this.request({method: 'delete', url, data: params})
	}

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

module.exports = new Fetch()