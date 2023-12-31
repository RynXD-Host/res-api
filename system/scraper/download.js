const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const { sizeFormatter } = require("human-readable");

const formatp = sizeFormatter({
  std: "JEDEC",
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

async function getType(url) {
  return new Promise(async (resolve, reject) => {
    axios.get(url).then((a) => {
      if (a.data.includes("-i-photomode-")) {
        resolve("image");
      } else {
        resolve("video");
      }
    });
  });
}

function findBetween(str, start, end) {
  const startIndex = str.indexOf(start) + start.length;
  const endIndex = str.indexOf(end, startIndex);
  return str.substring(startIndex, endIndex);
}

class Download {
  tiktok = (url) => {
    return new Promise(async (resolve, reject) => {
      let type = await getType(url);
      let get = await axios({
        url: "https://ttsave.app/download",
        method: "POST",
        params: {
          mode: type == "image" ? "slide" : "video",
          key: "0e23d2bf-e520-4ac7-9cf3-27f60a4a8cee",
        },
        data: { id: url },
      });
      const $ = cheerio.load(get.data);
      const res = {
        type: type,
        name: $("h2").text(),
        username: $("a.font-extrabold.text-blue-400.text-xl").text().trim(),
        profile: $(".flex.flex-col.justify-center.items-center > img").attr(
          "src",
        ),
        views: $(
          ".flex.flex-row.items-center.justify-center div:nth-child(1) span",
        )
          .text()
          .trim(),
        likes: $(
          ".flex.flex-row.items-center.justify-center div:nth-child(2) span",
        )
          .text()
          .trim(),
        comments: $(
          ".flex.flex-row.items-center.justify-center div:nth-child(3) span",
        )
          .text()
          .trim(),
        favorite: $(
          ".flex.flex-row.items-center.justify-center div:nth-child(4) span",
        )
          .text()
          .trim(),
        shares: $(
          ".flex.flex-row.items-center.justify-center div:nth-child(5) span",
        )
          .text()
          .trim(),
        sound: $(
          "div#button-download-ready .flex.flex-row.items-center.justify-center.mt-5.w-3/4 span",
        )
          .text()
          .trim(),
        description: $("p").text().trim(),
      };

      if (res.type === "video") {
        const videoUrl = {};
        $("div#button-download-ready a").each((index, element) => {
          const link = $(element).attr("href");
          const type = $(element).attr("type");
          videoUrl[type] = link;
        });
        res.video = videoUrl;
      }

      if (res.type === "image") {
        const imageUrl = [];
        $('div#button-download-ready a[type="slide"]').each(
          (index, element) => {
            imageUrl.push($(element).attr("href"));
          },
        );
        res.image = imageUrl;
      }
      resolve(res);
    });
  };
  instagram = (url) => {
    return new Promise(async (resolve, reject) => {
      let urls;
      if (/(https:\/\/)?instagram\.com\/p\/[^\/?#&]+/.test(url))
        urls = "download-photo-instagram";
      if (
        /(https:\/\/)?instagram\.com\/stories\/highlight\/[^\/?#&]+/.test(url)
      )
        urls = "download-highlights-instagram";
      if (/(https:\/\/)?instagram\.com\/reel\/[^\/?#&]+/.test(url))
        urls = "download-reel-instagram";
      if (/(https:\/\/)?instagram\.com\/stories\/[^\/?#&]+/.test(url))
        urls = "download-story-instagram";
      const payload = new URLSearchParams(
        Object.entries({
          via: "form",
          ref: urls,
          url: url,
        }),
      );
      await axios
        .post("https://reelsaver.net/api/instagram", payload, {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
          },
        })
        .then((response) => {
          const res = response.data;
          resolve(res.data);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };
  igdl = async (url) => {
    return new Promise(async (resolve, reject) => {
      const payload = new URLSearchParams(
        Object.entries({
          url: url,
          host: "instagram",
        }),
      );
      await axios
        .request({
          method: "POST",
          baseURL: "https://saveinsta.io/core/ajax.php",
          data: payload,
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            cookie: "PHPSESSID=rmer1p00mtkqv64ai0pa429d4o",
            "user-agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
          },
        })
        .then((response) => {
          const $ = cheerio.load(response.data);
          const mediaURL = $(
            "div.row > div.col-md-12 > div.row.story-container.mt-4.pb-4.border-bottom",
          )
            .map((_, el) => {
              return (
                "https://saveinsta.io/" +
                $(el).find("div.col-md-8.mx-auto > a").attr("href")
              );
            })
            .get();
          const res = {
            status: 200,
            media: mediaURL,
          };
          resolve(res);
        })
        .catch((e) => {
          console.log(e);
          throw {
            status: 400,
            message: "error",
          };
        });
    });
  };
  facebook = (url) => {
    return new Promise(async (resolve, reject) => {
      if (/(https:\/\/)?instagram\.com/.test(url)) throw "Invalid url!!";
      await axios
        .post(
          this.facebookURL + "/process",
          {
            id: url,
            locale: "id",
          },
          {
            headers: {
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              "user-agent":
                "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            },
          },
        )
        .then((response) => {
          const $ = cheerio.load(response.data);
          const result = {};
          const hdLink = $(".hd-button").attr("href");
          const sdLink = $(".sd-button").attr("href");

          result["hd"] = {
            quality: "720p(HD)",
            url: hdLink,
          };

          result["sd"] = {
            quality: "360p(SD)",
            url: sdLink,
          };
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };
  pinterest = async (query) => {
    if (query.match(URL_REGEX)) {
      let res = await fetch(
        `https://savepin.io/frontendService/DownloaderService?url=${query}`,
      );
      let item = await res.json();
      const mp4Media = item.medias.find((media) => media.extension === "mp4");
      if (mp4Media) {
        return mp4Media.url;
      } else {
        const jpgMedia = item.medias.find((media) => media.extension === "jpg");
        return jpgMedia.url;
      }
    } else {
      let res = await fetch(
        `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`,
      );
      let json = await res.json();
      let data = json.resource_response.data.results;
      if (!data.length) throw `Query "${query}" not found :/`;
      return data[~~(Math.random() * data.length)].images.orig.url;
    }
  };
  snackVideo = (url) => {
    return new Promise(async (resolve, reject) => {
      await axios
        .post("https://api.teknogram.id/v1/snackvideo", {
          url: url,
        })
        .then(({ data }) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e.data);
        });
    });
  };
  LikeDown = (url) => {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios.request(
        "https://likeedownloader.com/process",
        {
          method: "post",
          data: new URLSearchParams(Object.entries({ id: url, locale: "en" })),
          headers: {
            cookie:
              "_ga=GA1.2.553951407.1656223884; _gid=GA1.2.1157362698.1656223884; __gads=ID=0fc4d44a6b01b1bc-22880a0efed2008c:T=1656223884:RT=1656223884:S=ALNI_MYp2ZXD2vQmWnXc2WprkU_p6ynfug; __gpi=UID=0000069517bf965e:T=1656223884:RT=1656223884:S=ALNI_Map47wQbMbbf7TaZLm3TvZ1eI3hZw; PHPSESSID=e3oenugljjabut9egf1gsji7re; _gat_UA-3524196-10=1",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
          },
        },
      );
      const $ = cheerio.load(data.template);
      result = {
        status: 200,
        title: $("p.infotext").eq(0).text().trim(),
        thumbnail: $(".img_thumb img").attr("src"),
        watermark: $(".with_watermark").attr("href"),
        no_watermark: $(".without_watermark").attr("href"),
      };
      resolve(result);
    });
  };
  douyin = (url) => {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios("https://www.tikdd.cc/g1.php", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
        data: "url=" + url + "&count=12&cursor=0&web=1&hd=1",
        method: "POST",
      });
      resolve(data);
    });
  };
  krakenfiles = (url) => {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const fileHash = $("div.col-xl-4.col-lg-5.general-information").attr(
        "data-file-hash",
      );
      const tokens = $("input[name='token']").val();
      const result = {};
      const payload = new URLSearchParams(
        Object.entries({
          token: tokens,
        }),
      );
      const { data: res } = await axios.post(
        "https://s5.krakenfiles.com/download/" + fileHash,
        payload,
      );
      result.title = $("div.coin-info > .coin-name > h5").text().trim();
      $("div.nk-iv-wg4-sub > .nk-iv-wg4-overview.g-2 > li").each(function () {
        const param = $(this)
          .find("div.sub-text")
          .text()
          .replace(/ /g, "")
          .toLowerCase();
        const value = $(this).find("div.lead-text").text().trim();
        result[param] = value;
      });
      result.views = $("div.views-count").text().trim();
      result.downloads = $("div.lead-text.downloads-count > strong")
        .text()
        .trim();
      result.fileHash = fileHash;
      result.url = res.url;
      resolve(result);
    });
  };
  cocofun = (url) => {
    return new Promise((resolve, reject) => {
      axios({
        url,
        method: "get",
        headers: {
          Cookie: "client_id=1a5afdcd-5574-4cfd-b43b-b30ad14c230e",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
        },
      })
        .then((data) => {
          $ = cheerio.load(data.data);
          let json;
          const res = $("script#appState").get();
          for (let i of res) {
            if (i.children && i.children[0] && i.children[0].data) {
              ress = i.children[0].data.split("window.APP_INITIAL_STATE=")[1];
              json = JSON.parse(ress);
            }
            const result = {
              status: 200,
              author: "YanzBotz",
              topic: json.share.post.post.content
                ? json.share.post.post.content
                : json.share.post.post.topic.topic,
              caption: $("meta[property='og:description']").attr("content"),
              play: json.share.post.post.playCount,
              like: json.share.post.post.likes,
              share: json.share.post.post.share,
              duration:
                json.share.post.post.videos[json.share.post.post.imgs[0].id]
                  .dur,
              thumbnail:
                json.share.post.post.videos[json.share.post.post.imgs[0].id]
                  .coverUrls[0],
              watermark:
                json.share.post.post.videos[json.share.post.post.imgs[0].id]
                  .urlwm,
              no_watermark:
                json.share.post.post.videos[json.share.post.post.imgs[0].id]
                  .url,
            };
            resolve(result);
          }
        })
        .catch(reject);
    });
  };
  capcut = (url) => {
    return new Promise(async (resolve, reject) => {
      axios
        .get("https://ssscap.net/api/download/get-url?url=" + url, {
          headers: {
            cookie:
              "sign=94b3b2331a3515b3a031f161e6ce27a7; device-time=1693144685653",
          },
        })
        .then((res) => {
          let tes = res.data.url;
          const parsedUrl = new URL(tes);
          let id = parsedUrl.searchParams.get("template_id");

          axios("https://ssscap.net/api/download/" + id, {
            headers: {
              cookie:
                "sign=4b0366645cd40cbe10af9aa18331a488; device-time=1693145535913",
            },
          }).then((yanz) => {
            resolve(yanz.data);
          });
        });
    });
  };
  GDriveDl = async (url) => {
    let id;
    if (!(url && url.match(/drive\.google/i))) throw "Invalid URL";
    id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
    if (!id) throw "ID Not Found";
    let res = await fetch(
      `https://drive.google.com/uc?id=${id}&authuser=0&export=download`,
      {
        method: "post",
        headers: {
          "accept-encoding": "gzip, deflate, br",
          "content-length": 0,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          origin: "https://drive.google.com",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
          "x-client-data": "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
          "x-drive-first-party": "DriveWebUi",
          "x-json-requested": "true",
        },
      },
    );
    let { fileName, sizeBytes, downloadUrl } = JSON.parse(
      (await res.text()).slice(4),
    );
    if (!downloadUrl) throw "Link Download Limit!";
    let data = await fetch(downloadUrl);
    if (data.status !== 200) throw data.statusText;
    return {
      downloadUrl,
      fileName,
      fileSize: formatp(sizeBytes),
      mimetype: data.headers.get("content-type"),
    };
  };
  sfiledown = (url) => {
    return new Promise(async (resolve, reject) => {
      const html = await axios.get(url).then(({ data }) => {
        const $ = cheerio.load(data);
        const urls = $("#download").attr("onclick");
        const results = {
          title: $("div.intro-container.w3-blue-grey h1").text().trim(),
          mimetype: $("div.list").eq(0).text().split("-")[1],
          url:
            $("#download").attr("href") +
            `&k=${urls.match(/(?<=\')[^\']+?(?=\')/g).pop()}`,
        };
        resolve(results);
      });
    });
  };
  xbuddy = (url) => {
    return new Promise(async (resolve, reject) => {
      let headers = {
        authority: "ab.9xbud.com",
        accept: "application/json, text/plain, */*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json; charset=UTF-8",
        origin: "https://9xbuddy.com",
        referer: "https://9xbuddy.com/",
        "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "Android",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "x-access-token": "false",
        "x-auth-token":
          "m6iW2sqX3V+W1c9gZpielptllZ7EYGaYnpabZZWexGJ/nYSWhIiwrs2Dg7e4jMN+dLqnqKqVrcebrY+ummlim5Rj",
        "x-requested-domain": "9xbuddy.com",
        "x-requested-with": "xmlhttprequest",
      };
      const { data } = await axios.post(
        "https://ab.9xbud.com/token",
        {},
        {
          headers,
        },
      );
      headers["X-Access-Token"] = data?.access_token;
      const response = await axios.post(
        "https://ab1.9xbud.com/extract",
        {
          url: encodeURIComponent(url),
          searchEngine: "yt",
        },
        {
          headers,
        },
      );
      resolve(response.data);
      console.log(response.data);
    });
  };
  terabox = (urls) => {
    return new Promise(async (resolve, reject) => {
      const req = await axios.get(urls, {
      	headers: {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6",
  Connection: "keep-alive",
  Cookie: "csrfToken=x0h2WkCSJZZ_ncegDtpABKzt; browserid=Bx3OwxDFKx7eOi8np2AQo2HhlYs5Ww9S8GDf6Bg0q8MTw7cl_3hv7LEcgzk=; lang=en; TSID=pdZVCjBvomsN0LnvT407VJiaJZlfHlVy; __bid_n=187fc5b9ec480cfe574207; ndus=Y-ZNVKxteHuixZLS-xPAQRmqh5zukWbTHVjen34w; __stripe_mid=895ddb1a-fe7d-43fa-a124-406268fe0d0c36e2ae; ndut_fmt=FF870BBFA15F9038B3A39F5DDDF1188864768A8E63DC6AEC54785FCD371BB182",
  DNT: "1",
  Host: "www.4funbox.com",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  "sec-ch-ua": '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
}, 
      	withCredentials: true 
      });
      const responseData = req.data;

      const jsToken = findBetween(responseData, "fn%28%22", "%22%29");
      const logid = findBetween(responseData, "dp-logid=", "&");
      if (!jsToken || !logid) {
        return resolve({ error: "Invalid jsToken, logid" });
      }

      const { searchParams: requestUrl, href } = new URL(urls);
      if (!requestUrl.has("surl")) {
        return resolve({ error: "Missing data" });
      }
      const surl = requestUrl.get("surl");

      const params = {
        app_id: "250528",
        web: "1",
        channel: "dubox",
        clienttype: "0",
        jsToken: jsToken,
        dplogid: logid,
        page: "1",
        num: "20",
        order: "time",
        desc: "1",
        site_referer: href,
        shorturl: surl,
        root: "1",
      };

      const response = await axios.get("https://www.4funbox.com/share/list", {
        params,
        headers: {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6",
  Connection: "keep-alive",
  Cookie: "csrfToken=x0h2WkCSJZZ_ncegDtpABKzt; browserid=Bx3OwxDFKx7eOi8np2AQo2HhlYs5Ww9S8GDf6Bg0q8MTw7cl_3hv7LEcgzk=; lang=en; TSID=pdZVCjBvomsN0LnvT407VJiaJZlfHlVy; __bid_n=187fc5b9ec480cfe574207; ndus=Y-ZNVKxteHuixZLS-xPAQRmqh5zukWbTHVjen34w; __stripe_mid=895ddb1a-fe7d-43fa-a124-406268fe0d0c36e2ae; ndut_fmt=FF870BBFA15F9038B3A39F5DDDF1188864768A8E63DC6AEC54785FCD371BB182",
  DNT: "1",
  Host: "www.4funbox.com",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  "sec-ch-ua": '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
},
        withCredentials: true,
      });
      const responseData2 = response.data;
      if ((!"list") in responseData2) {
        resolve({ error: "Invalid response" });
      }
      resolve(responseData2?.list[0]);
    });
  };

  jooxdl = (url) => {
    return new Promise(async (resolve, reject) => {
      await axios
        .get(
          "http://api.joox.com/web-fcgi-bin/web_get_songinfo?songid=" +
            url +
            "&lang=id&country=id&from_type=null&channel_id=null&_=" +
            new Date().getTime(),
          {
            headers: {
              "Content-Type": "application/json",
              Cookie:
                "wmid=142420656; user_type=1; country=id; session_key=2a5d97d05dc8fe238150184eaf3519ad;",
              useragent:
                "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36",
            },
          },
        )
        .then((res) => {
          const mentahan = res.data;
          const replaced = mentahan.replace("MusicInfoCallback(", "").replace(
            `}
)`,
            "}",
          );
          const jsone = JSON.parse(replaced);
          const title = jsone.msong;
          const artist = jsone.msinger;
          const album = jsone.malbum;
          const img = jsone.imgSrc;
          const mp3_url = jsone.mp3Url;
          const filesize = jsone.size128;
          const finalsize = niceBytes(filesize);
          const ext = "mp3";
          const interval = jsone.minterval;
          const duration = moment.duration(interval, "seconds");
          const m = duration.minutes(); // 20
          const s = duration.seconds(); // 25
          const durasi = `${m}:${s}`;
          const result = {
            judul: title,
            artist: artist,
            album: album,
            img_url: img,
            mp3_url: mp3_url,
            filesize: finalsize,
            ext: ext,
            duration: durasi,
          };
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}



exports.download = new Download();