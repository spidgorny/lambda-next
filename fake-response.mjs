import { makeJsonOutput } from "./router.mjs";

export class FakeResponse {
	_status = 200;
	response;
	headers = {
		'content-type': 'text/plain'
	};

	status(x) {
		this._status = x;
		return this;
	}

	send(x) {
		this.response = x;
		return this;
	}

	json(x) {
		this.response = x;
		this.setHeader('content-type', 'application/json');
		return this;
	}

	header(key, val) {
		this.setHeader(key, val);
		return this;
	}

	setHeader(key, val) {
		this.headers[key] = val;
		return this;
	}

	getHeader(key) {
		const lcKeys = Object.fromEntries(
			Object.entries(this.headers)
				.map(([key, val]) => [key.toLowerCase(), val])
		);
		console.log({lcKeys, key: key.toLowerCase()});
		return lcKeys[key.toLowerCase()];
	}

	get headersSent() {
		return Object.keys(this.headers).length;
	}

	getContentType() {
		return this.getHeader('content-type') ?? '';
	}

	makeLambdaOutput() {
		let output = {
			statusCode: this._status,
			headers: this.headers,
		}
		let contentType = this.getContentType() ?? '';
		if (contentType === 'application/json') {
			return makeJsonOutput(this.response);
		}
		if (contentType.startsWith('text/')) {
			output = {
				...output,
				isBase64Encoded: false,
				body: this.response
			}
		} else {
			output = {
				...output,
				isBase64Encoded: true,
				body: Buffer.from(this.response).toString('base64')
			}
		}
		console.log(output);
		return output;
	}
}
