export class FakeRequest {
	headers = {};
	method;
	path;

	constructor(event) {
		const { path, httpMethod, headers, pathParameters, queryStringParameters, requestContext} = event;
		this.method = httpMethod ?? requestContext.http.method;
		this.headers = headers;
		this.path = path ?? requestContext.http.path;
		this.pathParameters = pathParameters;
		this.query = queryStringParameters;
		this.url = 'https://' + requestContext.domainName + path;
		console.log(this);
	}

}
