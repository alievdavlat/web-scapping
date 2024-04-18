const puppeteer = require("puppeteer-extra");

const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: "2captcha",
      token: "a66e0fc4cce286d55d66c29fc625b6fe", // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
    },
    visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
  })
);

// puppeteer usage as normal
puppeteer.launch({ headless: false }).then(async (browser) => {
  const page = await browser.newPage();
  await page.goto("https://www.google.com/recaptcha/api2/demo");

  await page.waitForSelector('iframe[src*="recaptcha/"]')
  
  // Loop over all potential frames on that page
  for (const frame of page.mainFrame().childFrames()) {
    // Attempt to solve any potential captchas in those frames

    const { captchas, filtered, solutions, solved, error } =
      await page.solveRecaptchas();

    console.log(solved);
  }

  await Promise.all([
    page.waitForNavigation(),
    page.click(`#recaptcha-demo-submit`),
  ]);

  // await page.screenshot({ path: "response.png", fullPage: true });
  // await browser.close();
});
