const puppeteer = require('puppeteer');
const config = require(process.argv[2]);
const except = require('./except.js');

let browser = { close: async () => {} };
setTimeout(async () => {
  await browser.close();
  except.fatalError(config.username);
}, except.totalTimeout);

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, (seconds || 1) * 1000));

(async () => {
  try {
    browser = await puppeteer.launch({
      // headless: false,
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    // https://pptr.dev/#?product=Puppeteer&version=v10.4.0&show=api-pagesetdefaulttimeouttimeout
    await page.setDefaultTimeout(except.methodTimeout);
    await page.setDefaultNavigationTimeout(except.methodTimeout);

    await page.goto(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${config.client_id}&scope=offline_access%20User.Read&response_type=code&redirect_uri=${config.redirect_uri}`
    );

    console.log(
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${config.client_id}&scope=offline_access%20User.Read&response_type=code&redirect_uri=${config.redirect_uri}`
    );

    // email
    await page.waitForSelector('input[type=email]');
    await page.type('input[type=email]', config.username);
    // next
    await page.waitForSelector('[type=submit]');
    await sleep(1);
    await page.click('[type=submit]');

    // password
    await page.waitForSelector('input[type=password]');
    await page.type('input[type=password]', config.password);
    // login
    await sleep(3);
    await page.waitForSelector('[type=submit]');
    await page.click('[type=submit]');
    await page.waitForNavigation();

    // next
    await sleep(3);
    await page.waitForSelector('[type=submit]');
    await page.click('[type=submit]');
    await page.waitForNavigation();
    console.log('pass next')

    // keep login status
    // await sleep(3);
    // await page.waitForSelector('[type=submit]');
    // await page.click('[type=submit]');
    // await page.waitForNavigation();

    //skip
    try {
      await page.waitForSelector('a[class=a6b2BSrznMwPrVB6dvBqGQ]', \
      { timeout: 30000 });
      // If the element appears within the timeout, click it
      await page.click('a[class=a6b2BSrznMwPrVB6dvBqGQ]');
    } catch (error) {
      // If the element doesn't appear within the timeout, you can handle \
      // it here (or just continue without doing anything)
      console.log("Element didn't appear within the timeout, \
      continuing without clicking.");
    }    

    // consent
    await page.waitForSelector('[type=checkbox]');
    await sleep(1);
    await page.click('[type=checkbox]');
    console.log('pass check box')

    // accept
    await page.waitForSelector('[type=submit]');
    await page.click('[type=submit]');
    console.log('pass submit')
    // request redirect uri
    await sleep(3);
    await browser.close();
    console.log('exit')
    process.exit(0);
  } catch (error) {
    await browser.close();
    console.log('client.js catch error');
    except.fatalError(config.username, error);
  }
})();
