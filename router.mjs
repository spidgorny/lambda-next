import path from "path";
import fs from "fs";
import * as mime from "mime-types";
import {FakeResponse} from "./fake-response.mjs";
import { debugHandler } from "./handler.mjs";

export async function lambdaRouter(req, res) {
	try {
		const {path, method} = req;
		console.warn('<', method, path)
		if (path.startsWith('/_next/static')) {
			return await handleNextStatic(path, res);
		}
		if (path.startsWith('/_next/image')) {
			//await handleNextImage(path, res);
			return res.send('next/image not implemented');
		}
		if (path.startsWith('/api/')) {
			// return res.send(JSON.stringify({path}));
			const fake = await handleApi(req, path);
			// res.headers =
			return res.send(fake.response);
		}

		await handleIndex(path, res);
		if (!res.headersSent) {
			await handlePublic(path, res);
		}
		if (!res.headersSent) {
			throw new Error('404 Not Found');
		}
		return res;
	} catch (e) {
		console.error(e);
		res.type = 'json';
		return res.send(JSON.stringify({
			status: e.constructor.name ?? 'error',
			message: e.message,
			stack: e.stack.split("\n")
		}));
	}
}

async function handleIndex(pathName = 'index.html', res) {
	console.log('handleIndex', {pathName});
	if (!pathName || pathName === '/') {
		pathName = '/index.html';
	}
	const fullPath = path.resolve("./.next/server/pages/", pathName.replace('/', ''));
	const mimeType = mime.lookup(fullPath);
	console.log('handleIndex', {fullPath, mimeType});
	try {
		const html = fs.readFileSync(fullPath, 'utf8');
		console.log('handlePublic', {fullPath, mimeType});
		res.header('content-type', mimeType);
		return res.send(html);
	} catch (e) {
		console.error('ERROR', 'handleIndex', e.message);
		// silent not found
	}
}

export async function handleNextStatic(pathName, res) {
	const fullPath = path.resolve("./.next/static/", pathName.replace('/_next/static/', ''));
	const mimeType = mime.lookup(fullPath);
	console.log('handleNextStatic', {fullPath, mimeType});
	res.header('content-type', mimeType);
	const html = fs.readFileSync(fullPath, 'utf8');
	return res.send(html);
}

async function handlePublic(pathName, res) {
	const fullPath = path.resolve("./public/", pathName.replace('/', ''));
	try {
		const mimeType = mime.lookup(fullPath);
		console.log('handlePublic', {fullPath, mimeType});
		res.header('content-type', mimeType);
		const html = fs.readFileSync(fullPath, 'utf8');
		console.log('handlePublic', {html: html.length});
		return res.send(html);
	} catch (e) {
		console.error('ERROR', 'handlePublic', e.message);
		// silent not found
	}
}

async function handleApi(req, pathName) {
	// const codePath = "./.next/server/pages/api/hello.js";
	let pagesRoot = "./.next/server/pages/";
	const codePath = path.resolve(pagesRoot, pathName.replace('/', '') + '.js');
	if (!fileExists(codePath)) {
		// find file by []
		let apiDirPath = path.resolve(pagesRoot, path.dirname(pathName.replace('/', '')));
		console.log({apiDirPath})
		const filesStartingWithSquare = fs.readdirSync(apiDirPath);
		console.log({filesStartingWithSquare});
		const squareFile = filesStartingWithSquare.find(x => x.startsWith('['));
		if (!squareFile) {
			throw new Error(`404 API for [${pathName}] not found in [${apiDirPath}]`);
		}
		const squareFilePath = path.resolve(apiDirPath, squareFile);
		return loadRunApiHandler(squareFilePath, req);
	}
	return loadRunApiHandler(codePath, req);
}

async function loadRunApiHandler(codePath, req) {
	console.log({codePath})
	const code = await import(/* webpackIgnore: true */ 'file://' + codePath);
	console.log(code);
	const handler = code.default.default;
	console.log(handler);

	// const req = {
	// 	method,
	// 	query: {},
	// 	body: {},
	// };
	const res = new FakeResponse();
	await handler(req, res);

	console.log(res);
	return res;
}

function fileExists(filePath) {
	try {
		fs.accessSync(filePath);
		return true;
	} catch (e) {
		return false;
	}
}

export function makeJsonOutput(body) {
	let output = {
		statusCode: 200,
		headers: {
			'content-type': 'application/json',
		},
		isBase64Encoded: false,
		body: JSON.stringify({
			status: "ok",
			...body,
		}, null, 2)
	};
	// console.log(output);
	return output;
}
