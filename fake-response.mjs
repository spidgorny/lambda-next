export class FakeResponse {
	_status = 200;
	response;
	headers = {};

	status(x) {
		this._status = x;
		return this;
	}

	send(x) {
		this.response = x;
		return this;
	}

	json(x) {
		this.response = JSON.stringify(x, null, 2);
		return this;
	}

	setHeader(key, val) {
		this.headers[key] = val;
	}

	getHeader(key) {
		const lcKeys = Object.fromEntries(
			Object.entries(this.headers)
				.map(([key, val]) => [key.toLowerCase(), val])
		);
		return lcKeys[key.toLowerCase()];
	}

	getContentType() {
		return this.getHeader('content-type') ?? 'text/html';
	}

	makeLambdaOutput(body) {
		let output = {
			statusCode: this._status,
			headers: this.headers,
		}
		let contentType = this.getContentType();
		if (contentType.startsWith('text') || contentType === 'application/json') {
			output = {
				...output,
				isBase64Encoded: false,
				body: contentType === 'application/json' ? JSON.stringify({
					status: "ok",
					...body,
				}, null, 2) : body
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

