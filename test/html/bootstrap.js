const puppeteer = require("puppeteer");
const { expect, assert } = require("chai");
const _ = require("lodash");

const globalVariables = _.pick(global, ["browser", "expect", "assert", "page"]);

let page;

// puppeteer options
const opts = {
  headless: true,
  slowMo: 100,
  timeout: 10000
};

// expose variables
before(async function() {
  global.expect = expect;
  global.assert = assert;
  global.error = /Not allowed!/g; //TODO: reset the regex after test for rehuse
  global.browser = await puppeteer.launch(opts);
});

// close browser and reset global variables
after(function() {
  browser.close();

  global.browser = globalVariables.browser;
  global.expect = globalVariables.expect;
});

beforeEach(async function() {
  global.page = await browser.newPage();
});

afterEach(async function() {
  await global.page.close();
  delete global.page;
});
