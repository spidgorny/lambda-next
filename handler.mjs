import fs from 'fs';
import {FakeRequest} from "./fake-request.mjs";
import {FakeResponse} from "./fake-response.mjs";
import { lambdaRouter, makeJsonOutput } from "./router.mjs";
import next from "next";
import { parse } from "url";

export const server = async (event) => {
	try {
		// return makeJsonOutput(event);
		const {requestContext, headers, multiValueHeaders, ...eventProps} = event;
		console.log(eventProps);
		const {http} = requestContext;
		const {method, path} = http;
		if (path === '/debug') {
			return debugHandler(event);
		}

		const req = new FakeRequest(event);
		const res = new FakeResponse();
		// await lambdaRouter(req, res);

		const dev = process.env.NODE_ENV !== 'production';
		const app = next({dev,
			// dir: '.next/server'
		});
		const handle = app.getRequestHandler();
		const parsedUrl = parse(req.url, true);
		await handle(req, res, parsedUrl);

		return res.makeLambdaOutput();
	} catch (e) {
		return makeJsonOutput({
			status: 'error',
			message: e.message,
			stack: e.stack.split("\n"),
		})
	}
}

export async function debugHandler(event) {
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
