const chrome = require("chrome-cookies-secure");
const moment = require("moment");
const tough = require("tough-cookie");
const fs = require("fs");
const dotenvExpand = require("dotenv-expand");
const utf8 = require("utf8");

dotenvExpand(require("dotenv").config());

const { Cookie } = tough;
const { promisify } = require("util");

const getCookies = promisify(chrome.getCookies);

const baseUrl = process.env.BASE_URL;
const configPath = process.env.CONFIG_PATH;
const cookieName = process.env.COOKIE_NAME;
const cookiePath = `${configPath}/${cookieName}`;

async function getChromeCookies() {
  try {
    const chromeCookies = await getCookies(baseUrl, "header");

    if (chromeCookies) {
      return utf8.encode(chromeCookies);
    }
    return undefined;
  } catch (error) {
    console.log("Error updateNewCookies(): ", error);
    return undefined;
  }
}

async function updateChromeCookies() {
  try {
    const currentCookies = await getChromeCookies();

    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath);
    }

    fs.writeFileSync(`${cookiePath}`, currentCookies);
    console.log("Cookies updated.");
  } catch (error) {
    console.log("Error updateNewCookies(): ", error);
  }
}

/** TODO Write code to warn user if there are expired cookies  */
/* eslint  no-unused-vars: "warn" */
async function checkExpiredCookies(cookies) {
  try {
    const now = moment().utc();
    const expiredCookies = {};
    cookies.forEach(element => {
      const cookie = Cookie.parse(element.toString());
      if (
        moment(cookie.expires)
          .utc()
          .isBefore(now)
      ) {
        expiredCookies[cookie.key] = cookie.value;
      }
    });

    if (expiredCookies.length > 0) {
      return expiredCookies;
    }
    return undefined;
  } catch (error) {
    console.log("Error:", error);
    return undefined;
  }
}

module.exports = {
  getChromeCookies,
  updateChromeCookies
};
