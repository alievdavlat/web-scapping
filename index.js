const puppeteer = require("puppeteer");
const { read, write } = require("./utils/fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, //page ochib beradi
    defaultViewport: false, // pageni toliq qb ochadi
    userDataDir: "./tmp",
  });

  const page = await browser.newPage();
  await page.goto("https://m.kinonadzor.com/xfsearch/year/2023/");

  // screenshot qladi pageni
  // await page.screenshot({ path: "example.png" });

  const moviesBox = await page.$$("#dle-content > a");
  let isBtnDisabled = false;

  while (!isBtnDisabled) {
    let title = null;
    let img = null;
    let formatCountry = null;
    let info = null;

    for (let movies of moviesBox) {
     
      try {
        title = await page.evaluate(
          (el) => el.querySelector(" div > span").textContent,
          movies
        );
      } catch (err) {
        console.log(err);
      }

      try {
        img = await page.evaluate((el) => el.querySelector("img").src, movies);
      } catch (err) {
        console.log(err);
      }

      try {
        formatCountry = await page.evaluate(
          (el) => el.querySelector(".shfilinfo").textContent,
          movies
        );
      } catch (er) {
        console.log(er);
      }

      try {
        info = await page.evaluate((el) => {
          const genreElements = el.querySelectorAll(".shfilinfo");
          // Extract text content from each genre element
          return Array.from(genreElements, (element) =>
            element.textContent.trim()
          );
        }, movies);
      } catch (er) {
        console.log(er);
      }

      if (title || formatCountry || img || info) {
        const moviesData = read("movies.json");

        moviesData.push({
          id: moviesData[moviesData.length - 1]?.id + 1 || 1,
          title,
          formatCountry: formatCountry.trim(),
          info,
          img,
        });

        write("movies.json", moviesData);
      }

      // pagination

      await page.waitForSelector("span.pnext", { visible: true });

      const is_disabled =
        (await page.$("div.pagi-nav.clearfix.ignore-select > span.pnext")) !==
        null;

      isBtnDisabled = is_disabled;

      if (!is_disabled) {
        await page.click("span.pnext");
        await page.waitForNavigation();
      }

    }
  }

  await browser.close();
})();
