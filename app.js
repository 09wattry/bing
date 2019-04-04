const rp = require("request-promise-native");
const baseUrl = "https://www.bing.com";
const cheerio = require("cheerio");
const cutter = require('./cookie-cutter.js');

// Attributes
var cvid;
var iid;
var cookies =  "MUID=1A980C7DD163610D0CF5017CD5636278; SRCHD=AF=MD18D5; SRCHUID=V=2&GUID=A2D4CB12750845B2A62DE0F52E88ED45&dmnchg=1; MUIDB=1A980C7DD163610D0CF5017CD5636278; BPF=X=1; CSRFCookie=4b350667-c240-4cd2-bafa-7c215631fce0; PPLState=1; ANON=A=B221CAA556402E06589C13A4FFFFFFFF&E=165a&W=1; NAP=V=1.9&E=1600&C=vGt8MrcODw-SG2oSFyEw8yR59BaCy3V059OQ3F772RKMvpewOPMzPw&W=1; KievRPSSecAuth=FABSARRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACCPWMNwzyytJEAHlphr9cyV4o5mav5kQUzxFF0t0adlnYedGh5Gcoyq/g7koP4P0g5Pc5CczIE%2BpGuCGtar2OX745cDFFcIXSuKuNCABh5%2BQmyFAyumUKNttH5tim/F%2BELXGNG1JsdRBOribeNnJpnwzsNmTdH58A1%2BdS%2Bnbjx6kRapb6key8ilAJzeX2%2BwelBk8wlvUCYZGgnjnXkpopkQysh0NcreIMyvhyI5DCXILveincCxpV8xFrMj21nO6R7IcOcTumdAheL9myksaTBq3M/i%2B9SOaZNL8JrUouID2QY/egSDQ3gB6IY86FS5Z6ygilp70w6VbgpNm103wFCDDVm1ZXfPNJ%2BTa2FDrXfQcsF0bonJCewXkkBQAQgIryJzqKG9WNbLXBe5tnVFTuq8%3D; _U=1C3biZ83htoEHXIp_0xbW9DcVo-jp5W7J1D9C6OK94hoJ8ssKJWZkL2f1_iL3Ys5666hzQTQpqp6V1boSF1OytKEN2pffHooBhunvWelcrALnua5QojgwWruPpOYBBrG1z_JRj1B-LPC2EHA0lK8MU7WCPP-AucXC2_akOj72fshT8pbs6aDQv9jipic3h0EU; WLS=C=54e91cacf244e079&N=Ryan; WLID=Zt/opAQ4nQzrGyxwYKDPsEKMjMGL5p1D0v6qJ9IkqsExZ2FBhpU33GME/IIhlEfUwqpUaGw/m7fyh6qLB0JqrefEc3dlKOattsO4ZijfSdY=; _EDGE_S=mkt=en-us&SID=2866555F0212652D2BA1584903AC64B8; _RwBf=s=10&o=0&A=B221CAA556402E06589C13A4FFFFFFFF; _UR=MC=1; SRCHUSR=DOB=20190305&T=1554379733000&POEX=W; ipv6=hit=1554383336965&t=6; _SS=SID=2866555F0212652D2BA1584903AC64B8&R=29834&RG=29000&RP=29834&RD=0&RM=0&RE=0&HV=1554380667&RA=-&BTOID=-&BTQID=-&BTQN=-&BTEC=-&BTMC=-&BTCO=-&BTRACI=-&BTTC=-&BTPCW=-&BTPOP=-&BTSTKey=-&bIm=421877&h5comp=0; ULC=P=9DE3|31:3&H=9DE3|31:3&T=9DE3|31:3:16; SRCHHPGUSR=CW=2560&CH=498&DPR=1&UTC=-240&WTS=63688771857";

cutter.getCookies(baseUrl, 'jar', function (err, jar) {
    cookie = jar;
});

async function getBingDotCom() {
    try {
        let options = {
            method: "GET",
            uri: baseUrl,
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        return await rp(options);
    } catch (error) {
        console.log("An error occurred while trying to reach www.bing.com", error);
    }
}

function getPageIG(attributes) {
    return attributes["_ig"];
}

function setCookie(cookie) {
    cookies = cookie
}

function getCVID() {
    return cvid;
}

function getIID() {
    return iid;
}

function getPageAttributes($) {
    return $("#nc_iid")[0].attribs;
}

async function setPageAttributes($) {
    let ids = $("#nc_iid")[0].attribs;
    cvid = ids["_ig"];
    iid = ids["_iid"];
}

async function setHeadersBing() {
    let uri = `/rewardsapp/ncheader`;
    let options = {
        method: "POST",
        uri: `${baseUrl}${uri}`,
        qs: {
            ver: "8_1_2_6220646",
            IID: "SERP.5064",
            IG: cvid
        },
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded",
            cookie: cookies,
            origin: `${baseUrl}`,
            referer: baseUrl + "/?FORM=Z9FD1",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
        },
        body: JSON.stringify({
            "wb": "1;i=1;v=1;"
        })
    };

    await rp(options);
}


async function setRewardsHeader() {
    let options = {
        method: "POST",
        uri: `${baseUrl}/rewardsapp/reportActivity`,
        qs: {
            IG: cvid,
            IID: "SERP.5106",
            src: "hp"
        },
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded",
            cookie: cookies,
            origin: `${baseUrl}`,
            referer: `${baseUrl}/?FORM=Z9FD1`,
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
        },
        body: JSON.stringify({
            url: "https://www.bing.com/",
            V: "web"
        })
    };
    await rp(options);
}

async function makeSearchRequest(query) {
    let searchURI = `${baseUrl}/search`;
    let options = {
        method: "POST",
        uri: searchURI,
        qs: {
            q: query,
            qs: "n",
            form: "QBLH",
            sp: -1,
            pq: query,
            sc: "8-4",
            sk: "",
            cvid: cvid
        },
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded",
            cookie: cookies,
            origin: `${baseUrl}`,
            referer: `${baseUrl}/?FORM=Z9FD1`,
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
        },
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    let searchPage = await rp(options);
    await reportActivity(getPageIG(getPageAttributes(searchPage)), query, searchURI);
}

async function reportActivity(ig, query, searchURI) {
    let uri = `${baseUrl}/rewardsapp/reportActivity`;
    let options = {
        method: "POST",
        uri: uri,
        qs: {
            IG: ig,
            IID: "SERP.5054",
            q: query,
            qs: "n",
            form: "QBLH",
            sp: -1,
            pq: query,
            sc: "8-4",
            sk: "",
            cvid: cvid
        },
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded",
            cookie: cookies,
            origin: `${baseUrl}`,
            referer: searchURI,
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36"
        }
    };

    await rp(options);
}

async function setup() {
    let page = await getBingDotCom();    
    await setPageAttributes(page);
    await setHeadersBing();
    await setRewardsHeader();
    await makeSearchRequest("GIVE ME POINTS!!!");
}

setup()
    .then(() => {
        console.log("+5 points!");
    }).catch((error) => {
        console.log("Error", error);
    })

module.exports = {
    makeSearchRequest: makeSearchRequest,
    setup: setup
};