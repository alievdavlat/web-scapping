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

  let isBtnDisabled = 0;

  while (isBtnDisabled < 14) {
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

      isBtnDisabled++;
      
      await page.waitForSelector("span.pnext", { visible: true });

      await page.click("span.pnext");
      await page.waitForNavigation({waitUntil:'networkidle2'});
    }
  }

  await browser.close();
})();
