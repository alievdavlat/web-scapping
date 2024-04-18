const puppeteer = require("puppeteer");
const { read, write } = require("./utils/fs");


(async () => {
  const browser = await puppeteer.launch({
    headless: false, //page ochib beradi
    defaultViewport: false, // pageni toliq qb ochadi
    userDataDir: "./tmp",
  });

  //pagination

  const page = await browser.newPage();
  await page.goto("https://m.kinonadzor.com/xfsearch/year/2023/page/1/", {
    waitUntil: "load",
  });

  const is_disabled = (await page.$("div.pagi-nav.clearfix.ignore-select > span.pnext")) !== null;

  console.log(is_disabled);

  await browser.close();
})();


