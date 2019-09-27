const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');
const writeStream = fs.createWriteStream('post.csv');
require('dotenv').config();
// Git change
// Git change 2
// Git change 3

// Write Headers
writeStream.write(`Status,ID,Name,Business Type,City,Phone,Expiration\n`);

app.get('/', async (req, res) => {
  try {
    const url = 'https://dmv2u.oregon.gov/eServices/_/';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1440,
      height: 1080
    });
    await page.goto(url);
    await page.click('#l_p-1-1');
    await page.waitForSelector('#c-7');
    await page.select('#c-7', 'DLR');
    await page.waitForSelector('#c-a');
    await page.click('#c-a');
    await page.waitFor(3000);
    await page.screenshot({
      path: 'whereAmI.png'
    });

    const businesses = [];
    let moreResults = true;

    while (moreResults) {
      const record = await page.evaluate(() => {
        const rowNodeList = document.querySelectorAll('.DocTableBody tr');
        const rowArray = Array.from(rowNodeList);
        return rowArray.slice(1).map(tr => {
          const dataNodeList = tr.querySelectorAll('td');
          const dataArray = Array.from(dataNodeList);

          return dataArray.map(td => {
            return td.textContent
              .replace(/Status: /g, '')
              .replace(/ID: /g, '')
              .replace(/Name: /g, '')
              .replace(/Business Type: /g, '')
              .replace(/Business City: /g, '')
              .replace(/Phone Number: /g, '')
              .replace(/Expiration: /g, '');
          });
        });
      });

      businesses.push(...record);

      try {
        await page.click('#c-m_pgnext');
      } catch (error) {
        moreResults = false;
      }
    }
    await browser.close();
    res.json(businesses);
  } catch (err) {
    res.json({
      err
    });
  }
});

app.listen(process.env.PORT, () => console.log('Server Started'));
