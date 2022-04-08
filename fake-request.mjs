export class FakeRequest {
	headers = {};
	method;
	path;

	constructor(event) {
		const {path, httpMethod, headers, pathParameters, queryStringParameters} = event;
		this.method = httpMethod;
		this.headers = headers;
		this.path = path;
		this.pathParameters = pathParameters;
		this.query = queryStringParameters;
		console.log(this);
	}

}

