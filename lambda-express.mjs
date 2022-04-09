import express from "express";
import { lambdaRouter } from "./router.mjs";
import dotenv from "dotenv";

dotenv.config({path: '.env'});
const app = express();
const port = 3000;

app.get('/*', async (req, res) => {
	await lambdaRouter(req, res);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
