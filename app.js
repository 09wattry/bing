const rp = require("request-promise-native");
const baseUrl = "https://www.bing.com";
const words = require('an-array-of-english-words');
const questionWords = ["What", "When", "Why", "How", "Who"];
const maxWord = words.length;
const os = require("os");
const homedir = os.homedir();
const appPath = `${homedir}/.bing`;
const usedPath = `${appPath}/used-sentences.js`;
const fs = require("fs");
var userAgents = {
    mobile: {
        count: 0,
        limit: (100 / 5),
        agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
    },
    pc: {
        count: 0,
        limit: (150 / 5),
        agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
    },
    edge: {
        count: 0,
        limit: (20 / 5),
        agent: "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136"
    }
};
const dailyLimit = (userAgents.mobile.limit + userAgents.pc.limit + userAgents.edge.limit);

// Attributes
var cvid;
var iid;
var bingCookies;
var agentUserHeader;
var sentences;

async function getBingDotCom() {
    try {
        let options = {
            method: "GET",
            uri: baseUrl
        };

        return (await rp(options));

    } catch (error) {
        console.log("An error occurred while trying to reach www.bing.com", error);
    }
}

async function setCookies() {
    try {
        if (fs.existsSync(`${appPath}/cookie`)) {
            bingCookies = fs.readFileSync(`${appPath}/cookie`, "utf8");
        }
    } catch (error) {
        console.log("Error setCookies(): ", error);
    }
}

function setAgent(type) {
    agentUserHeader = userAgents[type].agent
}

function getWindow(page) {
    try {
        const jsdom = require("jsdom");
        const {
            JSDOM
        } = jsdom;

        const dom = new JSDOM(page, {
            runScripts: "dangerously"
        });

        return dom.window;
    } catch (error) {
        console.log("Error getWindow(): ", error);
    }
}

function getPageAttributes(window) {
    return window._G;
}

async function setPageAttributes(globals) {
    cvid = globals._ig;
    iid = globals.iid;
}

function getNewSentence() {
    let qWord = questionWords[Math.floor(Math.random() * (questionWords.length))]
    let sentence = qWord;
    for (let i = 0; i < Math.floor(Math.random() * (10 - 1) + 1); i++) {
        var random = Math.floor(Math.random() * (maxWord));
        sentence += " " + words[random];
    }

    return sentence + "?";
}

function setSentences() {
    sentences = fs.existsSync(usedPath) ? fs.readFileSync(usedPath, "utf8").split(",") : [];
}

function setNewSentences() {
    try {
        fs.writeFileSync(usedPath, sentences);
    } catch (error) {
        console.log("setNewSentences: ", error);
    }
}

async function setHeadersBing() {
    try {
        let uri = `/rewardsapp/ncheader`;
        let options = {
            method: "POST",
            uri: `${baseUrl}${uri}`,
            qs: {
                ver: "8_1_2_6220646",
                IID: iid,
                IG: cvid
            },
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                cookie: bingCookies,
                origin: `${baseUrl}`,
                referer: baseUrl + "/?FORM=QBRE",
                "user-agent": agentUserHeader
            },
            body: JSON.stringify({
                "wb": "1;i=1;v=1;"
            })
        };

        await rp(options);
    } catch (error) {
        console.log("Error setHeadersBing: ", error);
    }
}

async function setRewardsHeader() {
    try {
        let options = {
            method: "POST",
            uri: `${baseUrl}/rewardsapp/reportActivity`,
            qs: {
                IG: cvid,
                IID: iid,
                src: "hp"
            },
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                cookie: bingCookies,
                origin: `${baseUrl}`,
                referer: `${baseUrl}/?FORM=Z9FD1`,
                "user-agent": agentUserHeader
            },
            body: JSON.stringify({
                url: "https://www.bing.com/",
                V: "web"
            })
        };
        await rp(options);
    } catch (error) {
        console.log("Error setRewardsHeader", error);
    }
}

async function makeSearchRequest(query) {
    let sentence = query ? encodeURI(query) : "";

    try {
        let searchURI = `${baseUrl}/search`;
        let options = {
            method: "POST",
            uri: searchURI,
            qs: {
                q: sentence,
                qs: "n",
                form: (agentUserHeader.match("Mobile")) ? "QBRE" : "QBLH",
                sp: -1,
                pq: sentence,
                sc: "8",
                sk: "",
                cvid: cvid
            },
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                cookie: bingCookies,
                origin: `${baseUrl}`,
                "user-agent": agentUserHeader,
                referer: `${baseUrl}/?FORM=QBRE`
            }
        };

        let attributes = getPageAttributes(getWindow(await rp(options)));

        await reportActivity(attributes, sentence, searchURI);
        if (sentences.includes(sentence)) {
            sentences.push(sentence + "(DUPLICATE)");
        } else {
            sentences.push(sentence);
        }

    } catch (error) {
        console.log("Error makeSearchRequest: ", error);
    }
}

async function reportActivity(attributes, sentence, searchURI) {
    try {
        let options = {
            method: "POST",
            uri: `${baseUrl}/rewardsapp/reportActivity`,
            qs: {
                IG: attributes["_ig"],
                IID: attributes["_iid"],
                q: sentence,
                qs: "n",
                form: "QBLH",
                sp: -1,
                pq: sentence,
                sc: "8-4",
                sk: "",
                cvid: cvid
            },
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "Content-Type": "application/x-www-form-urlencoded",
                cookie: bingCookies,
                origin: `${baseUrl}`,
                referer: searchURI,
                "user-agent": agentUserHeader
            }
        };

        await rp(options);
    } catch (error) {
        console.log("Error reportActivity", reportActivity);
    }
}

// setup().then(()=> {

// }).catch(()=> {})
async function setup() {
    try {
        await setCookies();
        let attributes = getPageAttributes(getWindow(await getBingDotCom()));
        setPageAttributes(attributes);
        setSentences();
        await setHeadersBing();
        await setRewardsHeader();
    } catch (error) {
        console.log("Error", error);
    }
}

async function run() {
    try {
        let min = 1734;
        let max = 8303;
        let interval = (Math.random() * (max - min) + min);

        const timer = setInterval(async () => {
            let dailyCount = (userAgents.mobile.count + userAgents.pc.count + userAgents.edge.count);

            if (dailyCount >= dailyLimit) {
                clearInterval(timer);
                setNewSentences();
                console.log("Done for the day!");
            } else {
                let sentence = getNewSentence();
                if (userAgents.mobile.count < userAgents.mobile.limit) {
                    userAgents.mobile.count++;
                    setAgent("mobile");
                } else if (userAgents.pc.count < userAgents.pc.limit) {
                    setAgent("pc");
                    userAgents.pc.count++;
                } else if (userAgents.edge.count < userAgents.edge.limit) {
                    userAgents.edge.count++;
                    setAgent("edge");
                }

                await makeSearchRequest(sentence);
                console.log("Mobile: ", userAgents.mobile.count, "Edge: ", userAgents.edge.count, "PC", userAgents.pc.count, "Total: ", dailyCount + 1);
            }
        }, interval);
    } catch (error) {

    }
}

module.exports = {
    setup: setup,
    run: run
};