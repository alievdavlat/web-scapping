const puppeteer = require("puppeteer");
const { read, write } = require("./utils/fs");

(async () => {
  const browser = await puppeteer.launch({
    // headless: false, //page ochib beradi
    // defaultViewport: false, // pageni toliq qb ochadi
    // userDataDir: "./tmp",
  });

  const page = await browser.newPage();
  await page.goto("https://m.kinonadzor.com/xfsearch/year/2023/page/1/");

  // screenshot qladi pageni
  // await page.screenshot({ path: "example.png" });
  const moviesBox = await page.$$("#dle-content > a");

  for (let movies of moviesBox) {
    let isBtnDisabled = false;

    while (!isBtnDisabled) {
      try {
        const title = await page.evaluate(
          (el) => el.querySelector(" div > span").textContent,
          movies
        );

        const img = await page.evaluate(
          (el) => el.querySelector("img").src,
          movies
        );

        console.log(img, "image");

        const formatCountry = await page.evaluate(
          (el) => el.querySelector(".shfilinfo").textContent,
          movies
        );

        const info = await page.evaluate((el) => {
          const genreElements = el.querySelectorAll(".shfilinfo");
          // Extract text content from each genre element
          return Array.from(genreElements, (element) =>
            element.textContent.trim()
          );
        }, movies);

        const moviesData = read("movies.json");

        moviesData.push({
          id: moviesData[moviesData.length - 1]?.id + 1 || 1,
          title,
          formatCountry: formatCountry.trim(),
          info,
          img,
        });

        write("movies.json", moviesData);

        pagination;
        const is_disabled =
          (await page.$("div.pagi-nav.clearfix.ignore-select > span.pnext")) !==
          null;
        isBtnDisabled = is_disabled;
        if (!is_disabled) {
          await page.click("div.pagi-nav.clearfix.ignore-select > span.pnext");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  await browser.close();
})();
