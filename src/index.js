const axios = require('axios')

const defaults = {
	baseURL: '',
	basePath: '',
	headers: {}
}

class Fetch {
	constructor() {
		this.option = defaults

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
			config.headers = this.getRequestHeaders()

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
		this.option.baseURL = baseURL
	}

	setRequestBasePath(basePath) {
		this.option.basePath = basePath
	}

	setRequestOption(option) {
		if (option.headers) {
			this.addRequestHeaders(option.headers)
			delete option.headers
		}
		Object.assign(this.option, option)
	}

	addRequestHeaders(headers = {}) {
		this.option.headers = {
			...this.option.headers,
			headers
		}
	}

	getRequestHeaders() {
		return this.option.headers
	}

	async raw(option) {
		return axios(option)
	}

	async request(option) {
		return await this.axiosInstance(this.option.baseURL + option.url)
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