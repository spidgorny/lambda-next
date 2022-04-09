import fs from 'fs';
import {FakeRequest} from "./fake-request.mjs";
import {FakeResponse} from "./fake-response.mjs";
import { lambdaRouter, makeJsonOutput } from "./router.mjs";

exports.server = async (event) => {
	try {
		const {requestContext, headers, multiValueHeaders, ...eventProps} = event;
		console.log(eventProps);
		const {path} = event;
		if (path === '/debug') {
			return debugHandler(event);
		}

		const req = new FakeRequest(event);
		const res = new FakeResponse();
		await lambdaRouter(req, res);
		return res.makeLambdaOutput();
	} catch (e) {
		return makeJsonOutput({
			status: 'error',
			message: e.message,
			stack: e.stack.split("\n"),
		})
	}
}

async function debugHandler(event) {
	const start = new Date();
	// console.log(event);
	const {path, httpMethod, headers, pathParameters, queryStringParameters} = event;
	// console.log(process.env);

	const filesNext = fs.readdirSync('.next');
	const filesStatic = fs.readdirSync('.next/static');
	const filesPublic = fs.readdirSync('public');
	const body = {
		path, httpMethod, pathParameters, queryStringParameters,
		filesNext,
		filesStatic,
		filesPublic,
		runtime: (new Date() - start) / 1000,
	}
	return makeJsonOutput(body);
}
