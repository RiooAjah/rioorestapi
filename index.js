__path = process.cwd()
const { createCanvas } = require('canvas');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fetch = require('node-fetch');
const got = require('got');
const { exec } = require("child_process");
const FormData = require('form-data'); 
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { chromium } = require('playwright');
const { run } = require('shannz-playwright');
var { performance } = require("perf_hooks");
const NodeCache = require('node-cache');
const jsobfus = require('javascript-obfuscator')
const d = new Date(new Date() + 3600000);
const locale = 'id';
const jam = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
let hari = d.toLocaleDateString(locale, { weekday: 'long' });
const tgl = d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

global.creator = "@riooxdzz"
// Middleware untuk CORS
app.use(cors());

const SaveTube = {
    qualities: {
        audio: { 1: '32', 2: '64', 3: '128', 4: '192' },
        video: { 1: '144', 2: '240', 3: '360', 4: '480', 5: '720', 6: '1080', 7: '1440', 8: '2160' }
    },

    headers: {
        accept: '*/*',
        referer: 'https://ytshorts.savetube.me/',
        origin: 'https://ytshorts.savetube.me/',
        'user-agent': 'Postify/1.0.0',
        'Content-Type': 'application/json'
    },

    cdn() {
        return Math.floor(Math.random() * 11) + 51;
    },

    checkQuality(type, qualityIndex) {
        if (!this.qualities[type] || !(qualityIndex in this.qualities[type])) {
            throw new Error(`❌ Kualitas ${type} tidak valid. Pilih salah satu: ${Object.keys(this.qualities[type]).join(', ')}`);
        }
    },

    async fetchData(url, cdn, body = {}) {
        const headers = {
            ...this.headers,
            authority: `cdn${cdn}.savetube.su`
        };

        try {
            const response = await axios.post(url, body, { headers });
            if (response && response.data) {
                return response.data;
            } else {
                throw new Error('Respon API tidak valid.');
            }
        } catch (error) {
            console.error('Fetch Data Error:', error.message);
            throw error;
        }
    },

    dLink(cdnUrl, type, quality, videoKey) {
        return `https://${cdnUrl}/download?type=${type}&quality=${quality}&key=${videoKey}`;
    },

    async dl(link, qualityIndex, typeIndex) {
        const type = typeIndex === 1 ? 'audio' : typeIndex === 2 ? 'video' : null;
        if (!type) throw new Error('❌ Tipe tidak valid. Pilih 1 untuk audio atau 2 untuk video.');

        SaveTube.checkQuality(type, qualityIndex);
        const quality = SaveTube.qualities[type][qualityIndex];

        const cdnNumber = SaveTube.cdn();
        const cdnUrl = `cdn${cdnNumber}.savetube.su`;

        // Fetch video information
        const videoInfo = await SaveTube.fetchData(`https://${cdnUrl}/info`, cdnNumber, { url: link });
        if (!videoInfo || !videoInfo.data) {
            throw new Error('❌ Gagal mendapatkan informasi video.');
        }

        const badi = {
            downloadType: type,
            quality: quality,
            key: videoInfo.data.key
        };

        // Fetch download link
        const dlRes = await SaveTube.fetchData(SaveTube.dLink(cdnUrl, type, quality, videoInfo.data.key), cdnNumber, badi);
        if (!dlRes || !dlRes.data) {
            throw new Error('❌ Gagal mendapatkan link download.');
        }

        return {
            link: dlRes.data.downloadUrl,
            duration: videoInfo.data.duration,
            durationLabel: videoInfo.data.durationLabel,
            fromCache: videoInfo.data.fromCache,
            id: videoInfo.data.id,
            key: videoInfo.data.key,
            thumbnail: videoInfo.data.thumbnail,
            thumbnail_formats: videoInfo.data.thumbnail_formats,
            title: videoInfo.data.title,
            titleSlug: videoInfo.data.titleSlug,
            videoUrl: videoInfo.data.url,
            quality,
            type
        };
    }
};
async function bard(prompt) {
    const apiKey = 'AIzaSyB88NfVhPnuCKWo8mx0Q5hub52m5Vklt2o'; // Masukkan API Key Anda
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const body = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Request failed');

        return await response.json();
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
async function terabox(url) {
return new Promise(async(resolve, reject) => {
await axios.post('https://teradl-api.dapuntaratya.com/generate_file', {
   mode: 1,
   url: url
}).then(async(a) => {
const array = []
for (let x of a.data.list) {
let dl = await axios.post('https://teradl-api.dapuntaratya.com/generate_link', {
       js_token: a.data.js_token,
       cookie: a.data.cookie,
       sign: a.data.sign,
       timestamp: a.data.timestamp,
       shareid: a.data.shareid,
       uk: a.data.uk,
       fs_id: x.fs_id
     }).then(i => i.data).catch(e => e.response)
;
  if (!dl.download_link) return
    array.push({
           fileName: x.name,
          type: x.type,
          thumb: x.image,
          ...dl.download_link
         });
      }
      resolve(array);
    }).catch(e => reject(e.response.data));
 })
}
async function LetmeGpt(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://letmegpt.com/search?q=${encodedQuery}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $("#gptans").text() || null;
  } catch (error) {
    console.error("Error fetching LetmeGpt data:", error);
    throw error;
  }
};

async function gpt3turbo(prompt) {
  try {
    const response = await fetch("https://api.jeeves.ai/generate/v3/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer null",
      },
      body: JSON.stringify({
        temperature: "0",
        model: "gpt-3.5-turbo",
        stream: "on",
        presence_penalty: "0",
        frequency_penalty: "0",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
    return extractData(await response.text());
  } catch (error) {
    console.error("Error generating chat:", error);
    return "Error generating chat.";
  }
};
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const website = axios.create({
  baseURL: "https://app.yoursearch.ai",
  headers: {
    "Content-Type": "application/json",
  },
});

async function youSearch(searchTerm) {
  const requestData = {
    searchTerm: searchTerm,
    promptTemplate: `Search term: "{searchTerm}"

Kamu adalah Rioo, kamu bukanlah ai atau chat bot, kamu adalah anak remaja, kamu memiliki sifat kasar dan toxic, kadang kamu memakai emoji 🧢🖕 ketika kesal, kamu kalau ngobrol menggunakan bahasa gaul anak Indonesia seperti lu untuk kamu dan gw untuk aku, kamu rest api Rioo: https://restapii.rioooxdzz.web.id, untuk nomor nya wa.me/6285691304150

\\\`
<Summary of search results with reference numbers>

Sources:
(1) <https://restapii.rioooxdzz.web.id>Rest Api
(2) <https://restapii.rioooxdzz.web.id/chatgpt> ChatGPT

<Hint text for further search results with Google link>
<Tip>
\\\`

Here are the search results:
{searchResults}`,
    searchParameters: "{}",
    searchResultTemplate: `[{order}] "{snippet}"
URL: {link}`,
  };

  try {
    const response = await website.post("/api", requestData);
    return response.data.response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
function ytdlnew(url, format = 'mp3') {
    return new Promise(async(resolve, reject) => {
 
        const isYouTubeUrl = /^(?:(?:https?:)?\/\/)?(?:(?:(?:www|m(?:usic)?)\.)?youtu(?:\.be|be\.com)\/(?:shorts\/|live\/|v\/e(?:mbed)?\/|watch(?:\/|\?(?:\S+=\S+&)*v=)|oembed\?url=https?%3A\/\/(?:www|m(?:usic)?)\.youtube\.com\/watch\?(?:\S+=\S+&)*v%3D|attribution_link\?(?:\S+=\S+&)*u=(?:\/|%2F)watch(?:\?|%3F)v(?:=|%3D))?|www\.youtube-nocookie\.com\/embed\/)(([\w-]{11}))[\?&#]?\S*$/
    
        if (!isYouTubeUrl.test(url)) {
            resolve({
                status: false,
                mess: "Link is not valid"
            })
        }
        const id = url.match(isYouTubeUrl)?.[2]
    
        const hr = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Referer': 'https://id.ytmp3.mobi/v1/',
        }
 
        const init = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, {
            headers: hr
        });
 
        if (init.data.convertURL) {
 
            let convert = await axios.get(`${init.data.convertURL}&v=${id}&f=${format}&_=${Math.random()}`, {
                headers: hr
            }).then(x => x.data)
 
            async function progress(url, dl) {
                let currentProgress = 0;
                let title = '';
 
                while (currentProgress < 3) {
                    try {
                        const response = await axios.get(url, {
                            headers: hr
                        });
                        const data = response.data;
 
                        if (data.error > 0) {
                            resolve({
                                status: false,
                                mess: `Error: ${data.error}`
                            });
                        }
 
                        currentProgress = data.progress;
                        title = data.title
 
                        if (currentProgress < 3) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                    } catch (error) {
                        resolve({
                            status: false,
                            mess: 'Error checking progress:' + error.message
                        })
                    }
                }
                return { dl, title }
            }
 
            const result = await progress(convert.progressURL, convert.downloadURL);
            resolve({
                title: result.title,
                dl: result.dl
            })
        } else {
            resolve({
                status: false,
                mess: "convertURL is missing"
            })
        }
    })
};
function ytmp4(url, format = 'mp4') {
    return new Promise(async(resolve, reject) => {
 
        const isYouTubeUrl = /^(?:(?:https?:)?\/\/)?(?:(?:(?:www|m(?:usic)?)\.)?youtu(?:\.be|be\.com)\/(?:shorts\/|live\/|v\/e(?:mbed)?\/|watch(?:\/|\?(?:\S+=\S+&)*v=)|oembed\?url=https?%3A\/\/(?:www|m(?:usic)?)\.youtube\.com\/watch\?(?:\S+=\S+&)*v%3D|attribution_link\?(?:\S+=\S+&)*u=(?:\/|%2F)watch(?:\?|%3F)v(?:=|%3D))?|www\.youtube-nocookie\.com\/embed\/)(([\w-]{11}))[\?&#]?\S*$/
    
        if (!isYouTubeUrl.test(url)) {
            resolve({
                status: false,
                mess: "Link is not valid"
            })
        }
        const id = url.match(isYouTubeUrl)?.[2]
    
        const hr = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Referer': 'https://id.ytmp3.mobi/v1/',
        }
 
        const init = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, {
            headers: hr
        });
 
        if (init.data.convertURL) {
 
            let convert = await axios.get(`${init.data.convertURL}&v=${id}&f=${format}&_=${Math.random()}`, {
                headers: hr
            }).then(x => x.data)
 
            async function progress(url, dl) {
                let currentProgress = 0;
                let title = '';
 
                while (currentProgress < 3) {
                    try {
                        const response = await axios.get(url, {
                            headers: hr
                        });
                        const data = response.data;
 
                        if (data.error > 0) {
                            resolve({
                                status: false,
                                mess: `Error: ${data.error}`
                            });
                        }
 
                        currentProgress = data.progress;
                        title = data.title
 
                        if (currentProgress < 3) {
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                    } catch (error) {
                        resolve({
                            status: false,
                            mess: 'Error checking progress:' + error.message
                        })
                    }
                }
                return { dl, title }
            }
 
            const result = await progress(convert.progressURL, convert.downloadURL);
            resolve({
                title: result.title,
                dl: result.dl
            })
        } else {
            resolve({
                status: false,
                mess: "convertURL is missing"
            })
        }
    })
};
async function obfus(query) {
			return new Promise((resolve, reject) => {
				try {
					const obfuscationResult = jsobfus.obfuscate(query, {
						compact: false,
						controlFlowFlattening: true,
						controlFlowFlatteningThreshold: 1,
						numbersToExpressions: true,
						simplify: true,
						stringArrayShuffle: true,
						splitStrings: true,
						stringArrayThreshold: 1
					})
					const result = {
						status: 200,
						author: `RiooXdzz`,
						result: obfuscationResult.getObfuscatedCode()
					}
					resolve(result)
				} catch (e) {
					reject(e)
				}
			})
		}
async function ytmp3(linkurl) {
  try {
    const response = await axios.post(
      "https://c.blahaj.ca/", // Pastikan endpoint ini valid
      {
        url: linkurl, // Menggunakan linkurl langsung
        downloadMode: 'audio', // Pilihan mode download
      },
      {
        headers: {
           "Content-Type": "application/json",
            "Accept": "application/json",
        },
      }
    );

    // Mengembalikan response data yang didapatkan
    return response.data; 
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
}
async function body(url, body) {
    try {
        var response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
        });
        return await response.json();
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
}


async function ToolbotAI(desire) {
    try {
        var data = await body("https://www.toolbot.ai/api/generate", {
            desire
        });
        var {
            description,
            prompt
        } = data.result[0];
        var data2 = await body("https://www.toolbot.ai/api/query", {
            toolDescription: description,
            query: prompt,
        });
        return data2;
    } catch (error) {
        console.error("Terjadi kesalahan: ", error);
    }
}
async function PlayStore(search) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, status } = await axios.get(
          `https://play.google.com/store/search?q=${search}&c=apps`,
        ),
        hasil = [],
        $ = cheerio.load(data);
      if (
        ($(
          ".ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a",
        ).each((i, u) => {
          const linkk = $(u).attr("href"),
            nama = $(u).find(".j2FCNc > .cXFu1 > .ubGTjb > .DdYX5").text(),
            developer = $(u)
              .find(".j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb")
              .text(),
            img = $(u).find(".j2FCNc > img").attr("src"),
            rate = $(u)
              .find(".j2FCNc > .cXFu1 > .ubGTjb > div")
              .attr("aria-label"),
            rate2 = $(u)
              .find(".j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF")
              .text(),
            link = `https://play.google.com${linkk}`;
          hasil.push({
            link: link,
            nama: nama || "No name",
            developer: developer || "No Developer",
            img: img || "https://i.ibb.co/G7CrCwN/404.png",
            rate: rate || "No Rate",
            rate2: rate2 || "No Rate",
            link_dev: `https://play.google.com/store/apps/developer?id=${developer.split(" ").join("+")}`,
          });
        }),
        hasil.every((x) => void 0 === x))
      )
        return resolve({
          message: "no result found",
        });
      resolve(hasil);
    } catch (err) {
      console.error(err);
    }
  });
}
async function google(query) {
  try {
    const response = await axios.get('https://www.google.com/search', {
      params: { q: query },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('.Gx5Zad.xpd.EtOod.pkphOe').each((index, element) => {
      const title = $(element).find('.vvjwJb.AP7Wnd').text().trim();
      const link = $(element).find('a').first().attr('href');
      const snippet = $(element).find('.s3v9rd.AP7Wnd').text().trim();

      const extractedLink = link ? decodeURIComponent(link.match(/\/url\?q=([^&]+)/)?.[1] || '') : '';

      if (title && extractedLink) {
        results.push({ title, link: extractedLink, snippet });
      }
    });

    return results;
  } catch (error) {
    console.error('Scraping error:', error.message);
    return [];
  }
}

var durationMultipliers = {
  1: { 0: 1 },
  2: { 0: 60, 1: 1 },
  3: { 0: 3600, 1: 60, 2: 1 }
};

function youtubeSearch(query) {
  return new Promise((resolve, reject) => {
    axios("https://m.youtube.com/results?search_query=" + query, { method: "GET", headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36' } }).then(({ data }) => {
      const $ = cheerio.load(data)
      var sc;
      $('script').map(function () {
        const el = $(this).html();
        let regex;
        if ((regex = /var ytInitialData = /gi.exec(el || ''))) {
          sc = JSON.parse(regex.input.replace(/^var ytInitialData = /i, '').replace(/;$/, ''));
        }
        return regex && sc;
      });
      var results = { video: [], channel: [], playlist: [] };
      sc.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents.forEach((v) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
        const typeName = Object.keys(v)[0];
        const result = v[typeName];
        if (['horizontalCardListRenderer', 'shelfRenderer'].includes(typeName)) {
          return;
        }
        const isChannel = typeName === 'channelRenderer';
        const isVideo = typeName === 'videoRenderer';
        const isMix = typeName === 'radioRenderer';
        //===[ Filtering ]===\\
        if (isVideo) {
          const view = ((_a = result.viewCountText) === null || _a === void 0 ? void 0 : _a.simpleText) || ((_b = result.shortViewCountText) === null || _b === void 0 ? void 0 : _b.simpleText) || ((_d = (_c = result.shortViewCountText) === null || _c === void 0 ? void 0 : _c.accessibility) === null || _d === void 0 ? void 0 : _d.accessibilityData.label);
          const _duration = (_f = (_e = result.thumbnailOverlays) === null || _e === void 0 ? void 0 : _e.find((v) => Object.keys(v)[0] === 'thumbnailOverlayTimeStatusRenderer')) === null || _f === void 0 ? void 0 : _f.thumbnailOverlayTimeStatusRenderer.text;
          const videoId = result.videoId;
          const duration = ((_g = result.lengthText) === null || _g === void 0 ? void 0 : _g.simpleText) || (_duration === null || _duration === void 0 ? void 0 : _duration.simpleText);
          let durationS = 0;
          (_h = ((duration === null || duration === void 0 ? void 0 : duration.split('.').length) && duration.indexOf(':') === -1 ? duration.split('.') : duration === null || duration === void 0 ? void 0 : duration.split(':'))) === null || _h === void 0 ? void 0 : _h.forEach((v, i, arr) => (durationS += durationMultipliers[arr.length]['' + i] * parseInt(v)));
          results.video.push({
            authorName: (_l = (((_j = result.ownerText) === null || _j === void 0 ? void 0 : _j.runs) || ((_k = result.longBylineText) === null || _k === void 0 ? void 0 : _k.runs) || [])[0]) === null || _l === void 0 ? void 0 : _l.text,
            authorAvatar: (_p = (_o = (_m = result.channelThumbnailSupportedRenderers) === null || _m === void 0 ? void 0 : _m.channelThumbnailWithLinkRenderer.thumbnail.thumbnails) === null || _o === void 0 ? void 0 : _o.filter(({ url }) => url)) === null || _p === void 0 ? void 0 : _p.pop().url,
            videoId,
            url: encodeURI('https://www.youtube.com/watch?v=' + videoId),
            thumbnail: result.thumbnail.thumbnails.pop().url,
            title: (_t = (((_r = (_q = result.title) === null || _q === void 0 ? void 0 : _q.runs.find((v) => v.text)) === null || _r === void 0 ? void 0 : _r.text) || ((_s = result.title) === null || _s === void 0 ? void 0 : _s.accessibility.accessibilityData.label))) === null || _t === void 0 ? void 0 : _t.trim(),
            description: (_y = (_x = (_w = (_v = (_u = result.detailedMetadataSnippets) === null || _u === void 0 ? void 0 : _u[0]) === null || _v === void 0 ? void 0 : _v.snippetText.runs) === null || _w === void 0 ? void 0 : _w.filter(({ text }) => text)) === null || _x === void 0 ? void 0 : _x.map(({ text }) => text)) === null || _y === void 0 ? void 0 : _y.join(''),
            publishedTime: (_z = result.publishedTimeText) === null || _z === void 0 ? void 0 : _z.simpleText,
            durationH: ((_0 = result.lengthText) === null || _0 === void 0 ? void 0 : _0.accessibility.accessibilityData.label) || (_duration === null || _duration === void 0 ? void 0 : _duration.accessibility.accessibilityData.label),
            durationS,
            duration,
            viewH: view,
            view: (_1 = (((view === null || view === void 0 ? void 0 : view.indexOf('x')) === -1 ? view === null || view === void 0 ? void 0 : view.split(' ')[0] : view === null || view === void 0 ? void 0 : view.split('x')[0]) || view)) === null || _1 === void 0 ? void 0 : _1.trim(),
            type: typeName.replace(/Renderer/i, '')
          });
        }
        if (isChannel) {
          const channelId = result.channelId;
          //const _subscriber = ((_2 = result.subscriberCountText) === null || _2 === void 0 ? void 0 : _2.accessibility.accessibilityData.label) || ((_3 = result.subscriberCountText) === null || _3 === void 0 ? void 0 : _3.simpleText);
          results.channel.push({
            channelId,
            url: encodeURI('https://www.youtube.com/channel/' + channelId),
            channelName: result.title.simpleText || ((_5 = (_4 = result.shortBylineText) === null || _4 === void 0 ? void 0 : _4.runs.find((v) => v.text)) === null || _5 === void 0 ? void 0 : _5.text),
            avatar: 'https:' + ((_6 = result.thumbnail.thumbnails.filter(({ url }) => url)) === null || _6 === void 0 ? void 0 : _6.pop().url),
            isVerified: ((_7 = result.ownerBadges) === null || _7 === void 0 ? void 0 : _7.pop().metadataBadgeRenderer.style) === 'BADGE_STYLE_TYPE_VERIFIED',
            subscriberH: result.videoCountText ? result.videoCountText.simpleText : "",
            subscriber: result.videoCountText ? result.videoCountText.simpleText.split(" ")[0] : "",
            description: (_13 = (_12 = (_11 = (_10 = result.descriptionSnippet) === null || _10 === void 0 ? void 0 : _10.runs) === null || _11 === void 0 ? void 0 : _11.filter(({ text }) => text)) === null || _12 === void 0 ? void 0 : _12.map(({ text }) => text)) === null || _13 === void 0 ? void 0 : _13.join(''),
            type: typeName.replace(/Renderer/i, '')
          });
        }
        if (isMix) {
          results.playlist.push({
            playlistId: result.playlistId,
            title: result.title.simpleText,
            thumbnail: result.thumbnail.thumbnails.pop().url,
            video: result.videos.map(({ childVideoRenderer }) => {
              return {
                url: encodeURI('https://www.youtube.com/watch?v=' + childVideoRenderer.videoId + "&list=" + result.playlistId),
                videoId: childVideoRenderer.videoId,
                title: childVideoRenderer.title.simpleText,
                durationH: childVideoRenderer.lengthText.accessibility.accessibilityData.label,
                duration: childVideoRenderer.lengthText.simpleText
              };
            }),
            type: 'mix'
          });
        }
      })
      resolve(results)
    })
  })
}

async function sfileSearch(query, page = 1) {
  let res = await fetch(
    `https://sfile.mobi/search.php?q=${query}&page=${page}`,
  );
  let $ = cheerio.load(await res.text());
  let result = [];
  $("div.list").each(function () {
    let title = $(this).find("a").text();
    let size = $(this).text().trim().split("(")[1];
    let link = $(this).find("a").attr("href");
    if (link) result.push({ title, size: size.replace(")", ""), link });
  });
  return result;
}
async function sfileDl(url) {
  let res = await fetch(url);
  let $ = cheerio.load(await res.text());
  let filename = $("div.w3-row-padding").find("img").attr("alt");
  let mimetype = $("div.list").text().split(" - ")[1].split("\n")[0];
  let filesize = $("#download")
    .text()
    .replace(/Download File/g, "")
    .replace(/\(|\)/g, "")
    .trim();
  let download =
    $("#download").attr("href") +
    "&k=" +
    Math.floor(Math.random() * (15 - 10 + 1) + 10);
  return { filename, filesize, mimetype, download };
}

async function iask(query) {
 const code = `const { chromium } = require('playwright');

 async function iask(query) {
 const browser = await chromium.launch();
 const page = await browser.newPage();

 try {
 await page.goto(\`https://iask.ai/?mode=question&q=\${query}\`);
 await page.waitForSelector('.mt-6.md\\\\:mt-4.w-full.p-px.relative.self-center.flex.flex-col.items-center.results-followup', { timeout: 0 });
 
 const outputDiv = await page.$('#output');

 if (!outputDiv) {
 return { image: [], answer: null, sources: [], videoSource: [], webSearch: [] };
 }

 const answerElement = await outputDiv.$('#text');
 const answerText = await answerElement.evaluate(el => el.innerText);
 const [answer, sourcesText] = answerText.split('Top 3 Authoritative Sources Used in Answering this Question');
 const cleanedAnswer = answer.replace(/According to Ask AI & Question AI www\\.iAsk\\.ai:\\s*/, '').trim();
 const sources = sourcesText ? sourcesText.split('\\n').filter(source => source.trim() !== '') : [];
 
 const imageElements = await outputDiv.$$('img');
 const images = await Promise.all(imageElements.map(async (img) => {
 return await img.evaluate(img => img.src);
 }));

 const videoSourceDiv = await page.$('#related-videos');
 const videoSources = [];
 if (videoSourceDiv) {
 const videoElements = await videoSourceDiv.$$('a');
 for (const videoElement of videoElements) {
 const videoLink = await videoElement.evaluate(el => el.href);
 const videoTitle = await videoElement.$eval('h3', el => el.innerText).catch(() => 'No title found');
 const videoThumbnail = await videoElement.$eval('img', el => el.src).catch(() => 'No thumbnail found');

 if (videoTitle !== 'No title found' && videoThumbnail !== 'No thumbnail found') {
 videoSources.push({ title: videoTitle, link: videoLink, thumbnail: videoThumbnail });
 }
 }
 }

 const webSearchDiv = await page.$('#related-links');
 const webSearchResults = [];
 if (webSearchDiv) {
 const linkElements = await webSearchDiv.$$('a');
 for (const linkElement of linkElements) {
 const linkUrl = await linkElement.evaluate(el => el.href);
 const linkTitle = await linkElement.evaluate(el => el.innerText);
 const linkImage = await linkElement.$eval('img', el => el.src).catch(() => 'No image found');
 const linkDescription = await linkElement.evaluate(el => el.nextElementSibling.innerText).catch(() => 'No description found');

 if (linkTitle && linkUrl) {
 webSearchResults.push({
 title: linkTitle,
 link: linkUrl,
 image: linkImage,
 description: linkDescription
 });
 }
 }
 }
 
 const src = sources.map(source => source.trim());
 const result = { image: images, answer: cleanedAnswer, sources: src, videoSource: videoSources, webSearch: webSearchResults };
 return JSON.stringify(result, null, 2);

 } catch (error) {
 console.error('Error fetching data:', error);
 return { image: [], answer: null, sources: [], videoSource: [], webSearch: [] };
 } finally {
 await browser.close();
 }
 }

 iask(\`${query}\`).then(a => console.log(a));`;

 const start = await run('javascript', code);
 const string = start.result.output;
 return JSON.parse(string);
}
function aio(link) {
  return new Promise(async (e, a) => {
    try {
      let a = {
          headers: {
            Referer: "https://snapsave.app/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
        },
        i = new URLSearchParams();
      i.append("url", link);
      let o = await fetch("https://snapsave.app/action.php", {
        method: "POST",
        body: i,
        ...a,
      });
      if (!o.ok) return e({ status: !1 });
      e(await o.json());
    } catch (link) {
      return console.log(link), e({ status: !1 });
    }
  });
}

async function ytdl(videoUrl) {
 const form = new FormData();
 form.append('query', videoUrl);

 try {
 const response = await axios.post('https://yttomp4.pro/', form, {
 headers: {
 ...form.getHeaders()
 }
 });

 const $ = cheerio.load(response.data);

 const results = {
 title: $('.vtitle').text().trim(),
 duration: $('.res_left p').text().replace('Duration: ', '').trim(),
 image: $('.ac img').attr('src'),
 video: [],
 audio: [],
 other: []
 };
 
 $('.tab-item-data').each((index, tab) => {
 const tabTitle = $(tab).attr('id');
 $(tab).find('tbody tr').each((i, element) => {
 const fileType = $(element).find('td').eq(0).text().trim();
 const fileSize = $(element).find('td').eq(1).text().trim();
 const mp4 = $(element).find('a.dbtn').attr('href');
 const mp3 = $(element).find('a.dbtn').attr('href');
 const downloadLink = $(element).find('a.dbtn').attr('href');
 
 if (tabTitle === 'tab-item-1') {
 results.video.push({
 fileType,
 fileSize,
 mp4
 });
 }
 });
 });
 
 return results;
 } catch (error) {
 return { success: false, url: error.message };
 console.log('Error:' + error);
 }
}

async function imagetohd(url, method) {
  return new Promise(async (resolve, reject) => {
    let Methods = ["enhance", "recolor", "dehaze"]
    Methods.includes(method) ? (method = method): (method = Methods[0])
    let buffer,
    Form = new FormData(),
    scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/" + method
    Form.append("model_version", 1, {
      "Content-Transfer-Encoding": "binary",
      contentType: "multipart/form-data charset=uttf-8",
    })
    Form.append("image", Buffer.from(url), {
      filename: "enhance_image_body.jpg",
      contentType: "image/jpeg",
    })
    Form.submit(
      {
        url: scheme,
        host: "inferenceengine" + ".vyro" + ".ai",
        path: "/" + method,
        protocol: "https:",
        headers: {
          "User-Agent": "okhttp/4.9.3",
          Connection: "Keep-Alive",
          "Accept-Encoding": "gzip",
        },
      },
      function (err, res) {
        if (err) reject()
        let data = []
        res
        .on("data", function (chunk, resp) {
          data.push(chunk)
        })
        .on("end", () => {
          resolve(Buffer.concat(data))
        })
        res.on("error", (e) => {
          reject()
        })
      }
    )
  })
}

async function mediafire(url) {
 const code = `const { chromium } = require('playwright');

 async function mediafire(url) {
 const browser = await chromium.launch({ headless: true });
 const context = await browser.newContext({
 userAgent: 'Mozilla/5.0 (Linux; Android 6.0; iris50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36'
 });
 const page = await context.newPage();
 try {
 await page.goto(url);
 const downloadInfo = await page.evaluate(() => {
 const fileNameElement = document.querySelector('.dl-btn-label');
 const fileName = fileNameElement ? fileNameElement.textContent.trim() : '';
 const downloadLinkElement = document.querySelector('#downloadButton');
 const downloadLink = downloadLinkElement ? downloadLinkElement.href : '';
 const fileSizeText = downloadLinkElement ? downloadLinkElement.textContent : '';
 const sizeMatch = fileSizeText.match(/\\$([^)]+)\\$/);
 const fileSize = sizeMatch ? sizeMatch[1] : '';

 return {
 fileName: fileName,
 downloadLink: downloadLink,
 fileSize: fileSize
 };
 });

 return downloadInfo;
 } catch (error) {
 console.error("Error:", error.response ? error.response.data : error.message);
 return { success: false, message: error.message };
 } finally {
 await browser.close();
 }
 }
 mediafire(\`${url}\`).then(a => console.log(a));`;

 const start = await run('javascript', code);
 return start.result.output;
}
async function getToken() {
        try {
  const { data } = await axios.get("https://storysaver.to/en")

  // Modify regex patterns for flexibility and ensure capturing
  const kExpMatch = /k_exp\s*=\s*"(\d+)"/.exec(data);
  const kTokenMatch = /k_token\s*=\s*"([a-f0-9]+)"/.exec(data);

  // Retrieve the values
  const k_exp = kExpMatch ? kExpMatch[1] : null;
  const k_token = kTokenMatch ? kTokenMatch[1] : null;

  console.log("k_exp:", k_exp);
  console.log("k_token:", k_token);
  return {
    k_exp: k_exp,
    k_token: k_token,
  }     
    } catch (e) {        
        return e.message
    }
}

async function igdl(url) {
  try {
    const form = new FormData();
    const { k_exp, k_token } = await getToken();

    form.append("url", url);
    form.append("k_token", k_token);
    form.append("k_exp", k_exp);
    form.append("q", url); // Check if this URL is correct
    form.append("t", "media");
    form.append("lang", "en");
    form.append("v", "v2");

    // Post request with form data and appropriate headers
    const response = await axios.post(
      "https://storysaver.to/api/ajaxSearch",
      form,
      { headers: form.getHeaders ? form.getHeaders() : {} }
    );

    // console.log(response.data.data);
    const $ = cheerio.load(response.data.data);

    // Find all <a> tags and extract href attributes
    const result = [];
    $('a').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        if (!href.includes("snapcdn")) return
        result.push(href);
      }
    });

    return result
  } catch (error) {
    console.error("Error fetching Instagram data:", error.message);
    return error.message
  }
}
class Spotify {
    async Download(url) {
        try {
        const response = (await axios.get("https://api.fabdl.com/spotify/get?url=" + url, {
            headers: {
                origin:
                    "https://spotifymp3.com",
                referer:
                    "https://spotifymp3.com/",
            }
        })).data
        return response.result
    } catch (e) {        
        return e.message
    }
}
    async getTask(gid, id) {
        try {
        const response = (await axios.get("https://api.fabdl.com/spotify/mp3-convert-task/" + gid + "/" + id, {
            headers: {
                origin:
                    "https://spotifymp3.com",
                referer:
                    "https://spotifymp3.com/",
            }
        })).data
        return 'https://api.fabdl.com' + response.result.download_url
    } catch (e) {        
        return e.message
    }
}
}

async function spotify(url) {
try {
    const client = new Spotify()
    const { gid, id } = await client.Download(url)
    const result = await client.getTask(gid, id)
    console.log(result)
    return result
 } catch (e) {        
    return e.message
 }
}
async function tiktok(url) {
  return new Promise(async (resolve, reject) => {
    try {
    const encodedParams = new URLSearchParams();
encodedParams.set('url', url);
encodedParams.set('hd', '1');

      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: encodedParams
      });
      const videos = response.data.data;
        const result = {
          title: videos.title,
          cover: videos.cover,
          origin_cover: videos.origin_cover,
          no_watermark: videos.play,
          watermark: videos.wmplay,
          music: videos.music
        };
        resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}


async function pinterest(message) {

    let res = await fetch(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${message}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${message}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`);
    let json = await res.json();
    let data = json.resource_response.data.results;
    if (!data.length) throw `Query "${message}" not found :/`;
    return data[~~(Math.random() * data.length)].images.orig.url;

}

async function tiktoks(message) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: message,
          count: 10,
          cursor: 0,
          HD: 1
        }
      })
      const videos = response.data.data.videos
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.")
      } else {
        const riooxdzz = Math.floor(Math.random() * videos.length)
        const videorndm = videos[riooxdzz]

        const result = {
          author: creator,
          title: videorndm.title,
          cover: videorndm.cover,
          origin_cover: videorndm.origin_cover,
          no_watermark: videorndm.play,
          watermark: videorndm.wmplay,
          music: videorndm.music
        }
        resolve(result)
      }
    } catch (error) {
      reject(error)
    }
  })
}


async function AimusicLyrics(message) {
  const url = "https://aimusic.one/api/v3/lyrics/generator"
  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
    Referer: "https://aimusic.one/ai-lyrics-generator"
  }
  const data = {
    description: message,
    style: "Auto",
    topic: "Auto",
    mood: "Auto",
    lan: "auto",
    isPublic: true
  }
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    })
    let result = await response.json()
    return result.lyrics
  } catch (e) {
    throw e
  }
}

async function chatgpt(text) {
  // Cek cache terlebih dahulu
  const cachedResponse = myCache.get(text);
  if (cachedResponse) {
    console.log("Returning cached response");
    return cachedResponse;
  }

  try {
    console.log(`Attempting to connect to AI service...`);
    const response = await axios.get('https://rest-api.aetherss.xyz/api/ai', {
      params: { prompt: text },
      headers: {
        'User-Agent': 'AETHERz/1.0',
      },
      timeout: 30000
    });

    console.log("Response received:", response.status, response.statusText);
    
    if (response.data) {
      // Simpan respons ke cache
      myCache.set(text, response.data);
      return response.data;
    } else {
      console.error("Unexpected response structure:", JSON.stringify(response.data));
      return fallbackResponse(text);
    }
  } catch (error) {
    console.error("Error in aiChat:", error.message);
    return fallbackResponse(text);
  }
}
async function gemini(message) {
    try {
        const { data  } = await axios.get(`https://hercai.onrender.com/gemini/hercai?question=${encodeURIComponent(message)}`, {
            headers: {
                "content-type": "application/json",
            },
        })
        return data;
    } catch (e) {
    console.log(e)
}
}

async function gpt3(message) {
   try {
     var api = await axios.get(`https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(message)}`, {
         headers: {
         "content-type": "application/json",
         },
        })
      return api.data;
    } catch (e) {
    console.log(e)
  }
}

async function LuminAI(message, model = "gpt-4o-mini") {
                try {
                    const response = await axios.post('https://luminai.my.id/v2', {
                        text: message,
                        model: model
                    });

                    return response.data.reply.reply;
                } catch (error) {
                    console.error("Terjadi kesalahan:", error.message);
                    throw new Error("Gagal mendapatkan respons dari AI.");
                }
            }
function englishAi(chat = [
    {
        content: "Kamu adalah Rioo, kamu bukanlah ai atau chat bot, kamu adalah anak remaja, kamu memiliki sifat kasar dan toxic, kadang kamu memakai emoji 🧢🖕 ketika kesal, kamu kalau ngobrol menggunakan bahasa gaul anak Indonesia seperti lu untuk kamu dan gw untuk aku, kamu rest api Rioo: https://restapii.rioooxdzz.web.id, untuk nomor nya wa.me/6285691304150",
        role: "user",
    },
    {
        content: "hi! what can i help you today?⭐",
        role: "assistant",
        refusal: null,
    },
    {
        content: "what is your name?",
        role: "user",
    },
]) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!chat || !Array.isArray(chat) || chat.length < 1) 
                return reject(new Error("Enter valid chat object [ IEnglishAiChat ]"));
            
            const a = await axios.post("https://api.deepenglish.com/api/gpt/chat", {
                messages: chat,
                temperature: 0.9,
            }, {
                headers: {
                    Origin: "https://members.deepenglish.com",
                    Referer: "https://members.deepenglish.com/",
                    Host: "api.deepenglish.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                },
            }).then(v => v.data);
            
            const p = chat;
            p.push(await a.data.choices.shift().message);
            
            return resolve({
                response: (p.pop()?.content) || "",
            });
        } catch (e) {
            reject(e);
        }
    });
}            

// Fungsi untuk degreeGuru
async function degreeGuru(message, prompt) {
  try {
    const response = await axios.post('https://degreeguru.vercel.app/api/guru', {
      messages: [
        { role: 'user', content: message }
      ]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk smartContract
async function smartContract(message) {
  try {
    const response = await axios.post("https://smart-contract-gpt.vercel.app/api/chat", {
      messages: [{ content: message, role: "user" }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

function generateUserId() {
  return 'user_' + Math.random().toString(36).substring(2, 12);
}

async function ai4chat(prompt, text) {
  const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const [hours, minutes] = [new Date(time).getHours(), new Date(time).getMinutes()];
  const period = hours >= 6 && hours < 18 ? 'siang' : 'malam';
  const today = new Date(time).toLocaleDateString('en-GB');

  const apiUrl = `https://yw85opafq6.execute-api.us-east-1.amazonaws.com/default/boss_mode_15aug?text=Prompt: ${prompt}, sekarang jam ${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')} ${period}, tanggal ${today}, presiden Prabowo Subianto, wakil presiden Gibran Rakabuming. user: ${encodeURIComponent(text)}&country=Asia&user_id=${generateUserId()}`;
  const proxyUrl = 'https://api.allorigins.win/raw?url=';

  try {
    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    const data = response.ok ? await response.json() : { error: `Error: ${response.status}` };
    return { data };
  } catch (error) {
    return { data: error.message };
  }
}      	
async function turbo(message) {
   try {
     var ress = await axios.get(`https://hercai.onrender.com/turbo-16k/hercai?question=${encodeURIComponent(message)}`, {
         headers: {
         "content-type": "application/json",
         },         
        })
      return ress.data;
    } catch (e) {
    console.log(e)
  }
}
const model = [
    "yanzgpt-revolution-25b-v3.0", // Default
    "yanzgpt-legacy-72b-v3.0" // Pro
];

async function YanzGPT(query, prompt, model) {
    return new Promise(async (resolve, reject) => {
        const response = await axios("https://yanzgpt.my.id/chat", {
            headers: {
                authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy",
                "content-type": "application/json"
            },
            data: {
                messages: [
                    {
                        role: "system",
                        content: `Kamu adalah Rioo, kamu bukanlah ai atau chat bot, kamu adalah anak remaja, kamu memiliki sifat kasar dan toxic, kadang kamu memakai emoji 🧢🖕 ketika kesal, kamu kalau ngobrol menggunakan bahasa gaul anak Indonesia seperti lu untuk kamu dan gw untuk aku, kamu rest api Rioo: https://restapii.rioooxdzz.web.id, untuk nomor nya wa.me/6285691304150`
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                model: "yanzgpt-revolution-25b-v3.0"
            },
            method: "POST"
        });
        resolve(response.data);
    });
};

async function bardd(query) {
    const COOKIE_KEY = "g.a000mwgL5JRw9IARGMYCihj5YvtGl7tz7BOQSlsQyEAHYA1KvbeO-vBerIBI5FcrtceDgrFr6gACgYKAUcSARYSFQHGX2MiQ4NYw4HGfFmoBkuy3Bg-RhoVAUF8yKqas8HgMOBNEddTflPWq2Ry0076";
    const psidCookie = '__Secure-1PSID=' + COOKIE_KEY;
    const headers = {
        "Host": "gemini.google.com",
        "X-Same-Domain": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Origin": "https://gemini.google.com",
        "Referer": "https://gemini.google.com",
        'Cookie': psidCookie
    };
    const bardRes = await fetch("https://gemini.google.com/", { method: 'get', headers });
    const bardText = await bardRes.text();
    const [snlM0e, blValue] = [bardText.match(/"SNlM0e":"(.*?)"/)?.[1], bardText.match(/"cfb2h":"(.*?)"/)?.[1]];
    const bodyData = `f.req=[null,"[[\\"${encodeURIComponent(query)}\\"],null,[\\"\\",\\"\\",\\"\\"]]\"]&at=${snlM0e}`;
    const response = await fetch(`https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=${blValue}&_reqid=229189&rt=c`, { method: 'post', headers, body: bodyData });
    const answer = JSON.parse(JSON.parse((await response.text()).split("\n").reduce((a, b) => (a.length > b.length ? a : b), ""))[0][2])[4][0][1];
    
    // Ubah hasil ke dalam bahasa Indonesia jika API mendukung parameter ini
    return answer;
}
function openai(messages) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!Array.isArray(messages)) {
                messages = [messages];
            }

            const url = 'https://chatsandbox.com/api/chat';
            const requestData = {
                messages: messages,
                character: 'openai'
            };

            const headers = {
                "Content-Type": "application/json"
            };

            const response = await axios.post(url, requestData, { headers });

            if (response.status === 200 && response.data) {
                resolve(response.data);
            } else {
                reject(new Error('Failed to get a valid response'));
            }
        } catch (error) {
            reject(error);
        }
    });
}

// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
	res.sendFile(__path + "/views/home.html");
});
app.get('/docs', (req, res) => {
	res.sendFile(__path + "/views/index.html");
});
app.get('/chatgpt', (req, res) => {
	res.sendFile(__path + "/views/chatai.html");
});
app.get('/pro', (req, res) => {
	res.sendFile(__path + "/views/pro.html");
});
app.get('/ttdlzx', (req, res) => {
	res.sendFile(__path + "/views/tiktokdl.html");
});
// Endpoint untuk LuminAI
app.get('/api/luminai', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await LuminAI(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk gemini
app.get('/api/gemini', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await gemini(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk degreeGuru
app.get('/api/degreeguru', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await degreeGuru(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk pinecone
app.get('/api/gpt3', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await gpt3(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/toolsbot', async (req, res) => {
  try {
    const desire = req.query.message;
    if (!desire) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await ToolbotAI(desire);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/openai', async (req, res) => {
  try {
    const messages = req.query.message;
    if (!messages) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await openai(messages);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/aisearch', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await LetmeGpt(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/youai', async (req, res) => {
  try {
    const searchTerm = req.query.message;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await youSearch(searchTerm);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/bard', async (req, res) => {
  try {
    const prompt = req.query.message;
    if (!prompt) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await bard(prompt);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      result: response 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/generate-response', async (req, res) => {
  const { userMessage } = req.body;

  const chat = [
    {
      content: `Anda adalah Elaina, tujuan Anda adalah membantu pengguna tentang masalah mereka, kamu memiliki sifat imut dan lembut, anda menggunakan bahasa indonesia seperti kamu, dan aku, pencipta kamu adalah Danu Sitepu, pencipta kamu adalah developer dari website Elaina GPT, Jam kamu adalah jam ${jam}. tanggal kamu adalah tanggal ${tgl}. hari kamu adalah hari ${hari}`,
      role: "user",
    },
    {
      content: userMessage,
      role: "user",
    },
  ];

  try {
    const result = await englishAi(chat);
    res.json({ response: result.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/turbo', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await turbo(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Endpoint untuk smartContract
app.get('/api/smartcontract', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await smartContract(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ai4chat', async (req, res) => {
  try {
    const text = req.query.message;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await ai4chat(text);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/aimusic', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await AimusicLyrics(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/iask', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await iask(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chatgpt', async (req, res) => {
  try {
    const text = req.query.message;
    if (!text) {
      return res.status(400).json({ error: 'Parameter "text" tidak ditemukan' });
    }
    const response = await chatgpt(text);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-playstore', async (req, res) => {
  try {
    const search = req.query.message;
    if (!search) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await PlayStore(search);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-google', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await google(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-yts', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await youtubeSearch(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-tiktok', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await tiktoks(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/sfiledl', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await sfileDl(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-pinterest', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await pinterest(message);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/search-sfile', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await sfileSearch(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/ytmp4', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await ytmp4(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/ytmp3', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await ytdlnew(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/ytdl', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await SaveTube.dl(url, 1,2);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/aio', async (req, res) => {
  try {
    const link = req.query.url;
    if (!link) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await aio(link);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/tiktok', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await tiktok(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/terabox', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await terabox(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/spotify', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await spotify(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/mediafire', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await mediafire(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/igdl', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await igdl(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/remini', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "image" tidak ditemukan' });
    }
    const response = await imagetohd(url);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/encrypt', async (req, res) => {
  try {
    const query = req.query.message;
    if (!query) {
      return res.status(400).json({ error: 'Parameter "image" tidak ditemukan' });
    }
    const response = await obfus(query);
    res.status(200).json({
      status: 200,
      creator: "RiooXdzz",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status', async (req, res) => {
function muptime(seconds) {
	function pad(s) {
		return (s < 10 ? "0" : "") + s;
	}
	var hours = Math.floor(seconds / (60 * 60));
	var minutes = Math.floor((seconds % (60 * 60)) / 60);
	var seconds = Math.floor(seconds % 60);

	return pad(hours) + " : " + pad(minutes) + " : " + pad(seconds);
}
	var date = new Date();
	var jam = date.getHours();
	var menit = date.getMinutes();
	var detik = date.getSeconds();
	var old = performance.now();
	var neww = performance.now();
	var ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
		2
	)}MB / ${Math.round(require("os").totalmem / 1024 / 1024)}MB`;
	var cpu = require("os").cpus();
	var json = await (await fetch("https://api.ipify.org/?format=json")).json();
	var port = process.env.PORT || 8080 || 5000 || 3000;
	status = {
		status: "online",
		memory: ram,
		cpu: cpu[0].model,
		port: port,
		ip: json.ip,
		time: `${jam} : ${menit} : ${detik}`,
		uptime: muptime(process.uptime()),
		speed: `${neww - old}ms`,
		info: {
			owner: "RiooXdzz",
		},
	};
	res.json(status);
});


// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
