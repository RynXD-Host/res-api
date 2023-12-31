const ytdl = require("ytdl-core");
const yts = require("yt-search");
const axios = require("axios");
const fetch = require("node-fetch");

const bytesToSize = (bytes) => {
  return new Promise((resolve, reject) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "n/a";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) resolve(`${bytes} ${sizes[i]}`);
    resolve(`${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`);
  });
};

const shortUrl = async (url) => {
  let res = await fetch("https://arifzyn.xyz/create", {
    method: "POST",
    body: new URLSearchParams(
      Object.entries({
        url: url,
        costum: "",
      }),
    ),
    headers: {
      "context-type": "application/json",
    },
  });
  let response = await res.json();
  return "https://arifzyn.xyz/" + response.result.id;
};

const formated = (ms) => {
  let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}; 

class YouTube {
  ytMp4 = (url) => {
    return new Promise(async (resolve, reject) => {
      ytdl
        .getInfo(url)
        .then(async (getUrl) => {
          let result = [];
          for (let i = 0; i < getUrl.formats.length; i++) {
            let item = getUrl.formats[i];
            if (
              item.container == "mp4" &&
              item.hasVideo == true &&
              item.hasAudio == true
            ) {
              let { qualityLabel, contentLength, approxDurationMs } = item;
              let bytes = await bytesToSize(contentLength);
              result[i] = {
                video: item.url,
                quality: qualityLabel,
                size: bytes,
                duration: formated(parseInt(approxDurationMs)),
              };
            }
          }
          let resultFix = result.filter(
            (x) =>
              x.video != undefined &&
              x.size != undefined &&
              x.quality != undefined,
          );
          let tinyUrl = resultFix[0].video
          let title = getUrl.videoDetails.title;
          let desc = getUrl.videoDetails.description;
          let views = parseInt(getUrl.videoDetails.viewCount || 0);
          let likes = getUrl.videoDetails.likes;
          let dislike = getUrl.videoDetails.dislikes;
          let channel = getUrl.videoDetails.ownerChannelName;
          let uploadDate = getUrl.videoDetails.uploadDate;
          let thumb =
            getUrl.player_response.microformat.playerMicroformatRenderer
              .thumbnail.thumbnails[0].url;
          resolve({
            title,
            result: tinyUrl,
            quality: resultFix[0].quality,
            size: resultFix[0].size,
            duration: resultFix[0].duration,
            thumb,
            views,
            likes,
            dislike,
            channel: channel ? channel.replace(/\s(\-\sTopic)/, "") : "Unknown",
            uploadDate,
            desc,
          });
        })
        .catch(reject);
    });
  };

  ytMp3 = (url) => {
    return new Promise((resolve, reject) => {
      ytdl
        .getInfo(url)
        .then(async (getUrl) => {
          let result = [];
          for (let i = 0; i < getUrl.formats.length; i++) {
            let item = getUrl.formats[i];
            if (item.mimeType == 'audio/webm; codecs="opus"') {
              let { contentLength, approxDurationMs } = item;
              let bytes = await bytesToSize(contentLength);
              result[i] = {
                audio: item.url,
                size: bytes,
                duration: formated(parseInt(approxDurationMs)),
              };
            }
          }
          let resultFix = result.filter(
            (x) => x.audio != undefined && x.size != undefined,
          );
          let tinyUrl = resultFix[0].audio
          let title = getUrl.videoDetails.title;
          let desc = getUrl.videoDetails.description;
          let views = parseInt(getUrl.videoDetails.viewCount || 0);
          let likes = getUrl.videoDetails.likes;
          let dislike = getUrl.videoDetails.dislikes;
          let channel = getUrl.videoDetails.ownerChannelName;
          let uploadDate = getUrl.videoDetails.uploadDate;
          let thumb =
            getUrl.player_response.microformat.playerMicroformatRenderer
              .thumbnail.thumbnails[0].url;
          resolve({
            title,
            result: tinyUrl,
            size: resultFix[0].size,
            duration: resultFix[0].duration,
            thumb,
            views,
            likes,
            dislike,
            channel: channel ? channel.replace(/\s(\-\sTopic)/, "") : "Unknown",
            uploadDate,
            desc,
          });
        })
        .catch(reject);
    });
  };

  ytPlay = (query) => {
    return new Promise((resolve, reject) => {
      yts(query)
        .then(async (getData) => {
          let result = getData.videos.slice(0, 5);
          let url = [];
          for (let i = 0; i < result.length; i++) {
            url.push(result[i].url);
          }
          let random = url[0];
          let getAudio = await this.ytMp3(random);
          resolve(getAudio);
        })
        .catch(reject);
    });
  };

  ytPlayVid = (query) => {
    return new Promise((resolve, reject) => {
      yts(query)
        .then(async (getData) => {
          let result = getData.videos.slice(0, 5);
          let url = [];
          for (let i = 0; i < result.length; i++) {
            url.push(result[i].url);
          }
          let random = url[0];
          let getVideo = await this.ytMp4(random);
          resolve(getVideo);
        })
        .catch(reject);
    });
  };
}

class YoutubeConverter {
  async analyzeAndConvert(videoUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const searchData = `query=${encodeURIComponent(videoUrl)}&vt=home`;
        const searchResponse = await axios.post("https://9convert.com/api/ajaxSearch/index", searchData, { headers: this.searchHeaders });

        const json = searchResponse.data
        const video = {};
        Object.values(json.links.mp4).forEach(({ q, size, k }) => {
          video[q] = {
            quality: q,
            fileSizeH: size,
            fileSize: parseFloat(size) * (/MB$/.test(size) ? 1000 : 1),
            download: () => this.convert(json.vid, k)
          };
        });
        const audio = {};
        Object.values(json.links.mp3).forEach(({ q, size, k }) => {
          audio[q] = {
            quality: q,
            fileSizeH: size,
            fileSize: parseFloat(size) * (/MB$/.test(size) ? 1000 : 1),
            download: () => this.convert(json.vid, k)
          };
        });
        const res = {
          id: json.vid,
          title: json.title,
          thumbnail: `https://i.ytimg.com/vi/${json.vid}/0.jpg`,
          video,
          audio
        };
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
  }

  async convert(vid, k) {
    return new Promise(async (resolve, reject) => {
      const params = `vid=${vid}&k=${k}`;
      const { data } = await axios.post("https://9convert.com/api/ajaxConvert/convert", params, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      })
      if (data.c_status == "CONVERTING") {
        const param = `vid=${vid}&b_id=${data.b_id}`
        const json = (await axios.post("https://9convert.com/api/ajaxConvert/checkTask", params, {
          headers: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          },
        }))
        resolve(json.data.dlink)
      } else {
        resolve(data.dlink)
      }
    })
  }
}

const YouTubeConvert = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
    const converter = new YoutubeConverter();
    const data = await converter.analyzeAndConvert('https://youtu.be/jsAn9AKWK40?si=6BtmluLIcbhwLTEs')
    resolve(data)
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
	youtube: new YouTube(),
	YouTube: YouTubeConvert,
}
	