const rp = require("request-promise-native");
const jsdom = require("jsdom");
const fs = require("fs");
const words = require("an-array-of-english-words");
const dotenvExpand = require("dotenv-expand");
const { createLogger, format, transports } = require("winston");

dotenvExpand(require("dotenv").config());

const baseUrl = process.env.BASE_URL;
const configPath = process.env.CONFIG_PATH;
const cookiePath = `${configPath}/${process.env.COOKIE_FILE_NAME}`;
const usedPath = process.env.USED_SENTENCES_FILE_PATH;
const questionWords = ["What", "When", "Why", "How", "Who"];
const maxWord = words.length;

const logger = createLogger({
  level: "info",
  format: format.combine(format.colorize(), format.simple()),
  transports: [
    new transports.Console({
      level: "info",
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});
const userAgents = {
  mobile: {
    count: 0,
    limit: 100 / 5,
    agent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
  },
  pc: {
    count: 0,
    limit: 150 / 5,
    agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
  },
  edge: {
    count: 0,
    limit: 20 / 5,
    agent:
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136"
  }
};
const dailyLimit =
  userAgents.mobile.limit + userAgents.pc.limit + userAgents.edge.limit;

// Attributes
let globals = {};
let cookies;
let agentUserHeader;
let sentences;

async function getBingDotCom() {
  try {
    const options = {
      method: "GET",
      uri: baseUrl
    };

    return await rp(options);
  } catch (error) {
    logger.info("An error occurred while trying to reach www.bing.com", error);
  }
  return undefined;
}

async function setCookies() {
  try {
    cookies = fs.readFileSync(cookiePath, "utf8");
  } catch (error) {
    logger.info("Error setCookies(): ", error);
  }
}

function setAgent(type) {
  agentUserHeader = userAgents[type].agent;
}

function getWindow(page) {
  try {
    const { JSDOM } = jsdom;
    const virtualConsole = new jsdom.VirtualConsole();
    const { window } = new JSDOM(page, {
      virtualConsole,
      runScripts: "dangerously"
    });

    virtualConsole.on("error", () => {});

    return window;
  } catch (error) {
    logger.info("Error getWindow(): ", error);
    return undefined;
  }
}

function getPageAttributes(window) {
  try {
    const attributes = window._G;

    attributes.iid = window.data_iid;

    return attributes;
  } catch (error) {
    logger.info(`Error getting page attributes: ${error}`);
    return undefined;
  }
}

async function setGlobalAttributes() {
  try {
    const page = await getBingDotCom();
    const window = await getWindow(page);

    globals = await getPageAttributes(window);
  } catch (error) {
    logger.info(`Unable to set global attributes: ${error}`);
  }
}

function getNewSentence() {
  try {
    const qWord =
      questionWords[Math.floor(Math.random() * questionWords.length)];
    let sentence = qWord;
    for (let i = 0; i < Math.floor(Math.random() * (10 - 1) + 1); i += 1) {
      const random = Math.floor(Math.random() * maxWord);
      sentence += ` ${words[random]}`;
    }

    return `${sentence}?`;
  } catch (error) {
    logger.info(`An error occurred a new sentence: ${error}`);
    return undefined;
  }
}

function setSentences() {
  try {
    sentences = fs.existsSync(usedPath)
      ? fs.readFileSync(usedPath, "utf8").split(",")
      : [];

    logger.info(`Used sentences set...`);
  } catch (error) {
    logger.info(`Unable to set sentences: ${error}`);
  }
}

function setNewSentences() {
  try {
    fs.writeFileSync(usedPath, sentences);
    logger.info(`New used sentences saved.`);
  } catch (error) {
    logger.info("setNewSentences: ", error);
  }
}

async function setHeadersBing() {
  try {
    const options = {
      method: "POST",
      uri: `${baseUrl}/rewardsapp/ncheader`,
      qs: {
        ver: globals.AppVer,
        IID: globals.iid,
        IG: globals.IG
      },
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: cookies,
        origin: baseUrl,
        referer: `${baseUrl}/?FORM=QBRE`,
        "user-agent": agentUserHeader
      },
      body: JSON.stringify({
        wb: "1;i=1;v=1;"
      })
    };

    await rp(options);
    logger.info(`Bing hearders set...`);
  } catch (error) {
    logger.info("Error setHeadersBing: ", error);
  }
}

async function setRewardsHeader() {
  try {
    const options = {
      method: "POST",
      uri: `${baseUrl}/rewardsapp/reportActivity`,
      qs: {
        IG: globals.IG,
        IID: globals.iid,
        src: "hp"
      },
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: cookies,
        origin: baseUrl,
        referer: `${baseUrl}/?FORM=Z9FD1`,
        "user-agent": agentUserHeader
      },
      body: JSON.stringify({
        url: baseUrl,
        V: "web"
      })
    };

    await rp(options);
    logger.info(`Reward headers set...`);
  } catch (error) {
    logger.info("Error setRewardsHeader", error);
  }
}

async function makeSearchRequest(query) {
  const sentence = query ? encodeURI(query) : "";

  try {
    const searchURI = `${baseUrl}/search`;
    const options = {
      method: "GET",
      uri: searchURI,
      qs: {
        q: sentence,
        qs: "n",
        form: agentUserHeader.match("Mobile") ? "QBRE" : "QBLH",
        sp: -1,
        pq: sentence,
        sc: "8",
        sk: "",
        cvid: globals.IG
      },
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: cookies,
        origin: baseUrl,
        "user-agent": agentUserHeader,
        referer: `${baseUrl}/?FORM=QBRE`
      }
    };

    const page = await rp(options);
    const window = getWindow(page);
    const attributes = getPageAttributes(window);

    await reportActivity(attributes, sentence, searchURI);
    if (sentences.includes(sentence)) {
      sentences.push(`${sentence}(DUPLICATE)`);
    } else {
      sentences.push(sentence);
    }
  } catch (error) {
    logger.info("Error makeSearchRequest: ", error);
  }
}

async function reportActivity(attributes, sentence, searchURI) {
  try {
    const options = {
      method: "POST",
      uri: `${baseUrl}/rewardsapp/reportActivity`,
      qs: {
        IG: attributes.IG,
        IID: attributes.iid,
        q: sentence,
        qs: "n",
        form: "QBLH",
        sp: -1,
        pq: sentence,
        sc: "8-4",
        sk: "",
        cvid: globals.IG
      },
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        cookie: cookies,
        origin: baseUrl,
        referer: searchURI,
        "user-agent": agentUserHeader
      }
    };

    await rp(options);
  } catch (error) {
    logger.info("Error reportActivity", reportActivity);
  }
}

async function setup() {
  try {
    setAgent("mobile");
    setSentences();
    setCookies();

    await setGlobalAttributes();
    await setHeadersBing();
    await setRewardsHeader();
    logger.info(`Application setup starting to run searches...`);
  } catch (error) {
    logger.info("Error while running application setup!", error);
  }
}

async function run() {
  try {
    const min = 1734;
    const max = 8303;
    const interval = Math.random() * (max - min) + min;

    const timer = setInterval(async () => {
      const dailyCount =
        userAgents.mobile.count + userAgents.pc.count + userAgents.edge.count;

      if (dailyCount >= dailyLimit) {
        clearInterval(timer);
        setNewSentences();

        logger.info("Done Binging for the day! Check your points.");
      } else {
        const sentence = getNewSentence();
        if (userAgents.mobile.count < userAgents.mobile.limit) {
          userAgents.mobile.count += 1;
          setAgent("mobile");
        } else if (userAgents.pc.count < userAgents.pc.limit) {
          setAgent("pc");
          userAgents.pc.count += 1;
        } else if (userAgents.edge.count < userAgents.edge.limit) {
          userAgents.edge.count += 1;
          setAgent("edge");
        }

        await makeSearchRequest(sentence);
        logger.info(
          `Mobile: ${userAgents.mobile.count}, Edge: ${
            userAgents.edge.count
          }, PC: ${userAgents.pc.count}, Total: ${dailyCount + 1}`
        );
      }
    }, interval);
  } catch (error) {
    logger.info(`Unable to make search request: ${error}`);
  }
}

module.exports = {
  setup,
  logger,
  run
};
