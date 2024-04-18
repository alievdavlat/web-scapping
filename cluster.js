const fs = require("fs");
const { Cluster } = require("puppeteer-cluster");
const {read , write} = require('./utils/fs');


const urls = [
  "https://www.amazon.com/s?k=gaming+keyboard&_encoding=UTF8&content-id=amzn1.sym.12129333-2117-4490-9c17-6d31baf0582a&pd_rd_r=4bf4d9a7-acbc-4cd4-8db5-bb5de0cfaba9&pd_rd_w=unRv1&pd_rd_wg=9UIME&pf_rd_p=12129333-2117-4490-9c17-6d31baf0582a&pf_rd_r=H0NV0566KQ8PA62X1S5W&ref=pd_gw_unk",
  "https://www.amazon.com/s?k=gaming+headsets&_encoding=UTF8&content-id=amzn1.sym.12129333-2117-4490-9c17-6d31baf0582a&pd_rd_r=4bf4d9a7-acbc-4cd4-8db5-bb5de0cfaba9&pd_rd_w=unRv1&pd_rd_wg=9UIME&pf_rd_p=12129333-2117-4490-9c17-6d31baf0582a&pf_rd_r=H0NV0566KQ8PA62X1S5W&ref=pd_gw_unk"
];

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    monitor: true,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: "./tmp",
    },
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);

    let isBtnDisabled = false;
    while (!isBtnDisabled) {
      await page.waitForSelector('[data-cel-widget="search_result_0"]');
      const productsHandles = await page.$$(
        "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
      );

      for (const producthandle of productsHandles) {
        let title = "Null";
        let price = "Null";
        let img = "Null";

        try {
          title = await page.evaluate(
            (el) => el.querySelector("h2 > a > span").textContent,
            producthandle
          );
        } catch (error) {}

        try {
          price = await page.evaluate(
            (el) => el.querySelector(".a-price > .a-offscreen").textContent,
            producthandle
          );
        } catch (error) {}

        try {
          img = await page.evaluate(
            (el) => el.querySelector(".s-image").getAttribute("src"),
            producthandle
          );
        } catch (error) {}
        if (title !== "Null") {
          const data = read('./model/moviesData.json')

          data.push({
            id: data[data.length - 1]?.id + 1 || 1,
            title,
            price,
            img
          })

          write("moviesData.json", data);

        }
      }

      await page.waitForSelector("li.a-last", { visible: true });
      const is_disabled = (await page.$("li.a-disabled.a-last")) !== null;

      isBtnDisabled = is_disabled;
      if (!is_disabled) {
        await Promise.all([
          page.click("li.a-last"),
          page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);
      }
    }
  });

  for (const url of urls) {
    await cluster.queue(url);
  }

  await cluster.idle();
  await cluster.close();
})();``