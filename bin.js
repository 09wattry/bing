const app = require("./app");
const chrome = require('chrome-cookies-secure');
const baseUrl = "https://www.bing.com";

try {
    chrome.getCookies(baseUrl, 'header', function (err, cookies) {
        if (err) throw err;
        app.setAgent("mobile");
        app.setCookies(cookies);
        app.setup();
        app.run();
    });
} catch (error) {
    console.log("An error occurred while making the request:", error);
}