const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');
const writeStream = fs.createWriteStream('post.csv');
require('dotenv').config();

// Write Headers
writeStream.write(`Status,ID,Name,Business Type,City,Phone,Expiration\n`);

app.get('/', async (req, res) => {
	try {
		const url = 'https://dmv2u.oregon.gov/eServices/_/';
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.setViewport({ width: 1440, height: 1080 });
		await page.goto(url);
		await page.click('#l_p-1-1');
		await page.waitForSelector('#c-7');
		await page.select('#c-7', 'DLR');
		await page.waitForSelector('#c-a');
		await page.click('#c-a');
		await page.waitFor(3000);
		await page.screenshot({ path: 'whereAmI.png' });

		// Build Array
		const table = await page.evaluate(() => {
			const tds = Array.from(document.querySelectorAll('.DTC span'));
			return tds.map((td) => td.innerHTML);
		});

		await browser.close();
		for (let i = 0; i < table.length; i += 7) {
			writeStream.write(
				`${table[i]},${table[i + 1]},${table[i + 2]},${table[i + 3]},${table[i + 4]},${table[i + 5]},${table[
					i + 7
				]}\n`
			);
		}

		res.sendFile(__dirname + '/post.csv');
	} catch (err) {
		res.json({ err });
	}
});

app.listen(process.env.PORT, () => console.log('Server Started'));
