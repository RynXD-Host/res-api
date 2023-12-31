const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const FormData = require("form-data");
const PDFDocument = require("pdfkit");
const config = require("../../config");

module.exports = class Function {
  constructor() {
    this.axios = axios
    this.cheerio = cheerio
    this.fetch = fetch
  }
  
  resSukses = (result) => {
    return {
      status: 200,
      creator: config.options.creator,
      result: result 
    }
  }

  resValid = (message) => {
    return {
      status: 500,
      creator: config.options.creator,
      message: message 
    }
  }
  
  deleteFile = (FilePath) => {
	setTimeout(() => {
		if (fs.existsSync(FilePath)) {
			fs.unlinkSync(FilePath);
			console.log(`File ${FilePath} dihapus.`);
		}
	}, 5 * 60 * 1000);
  }
  
  isUrl = (url) => {
    try {
      if (typeof url !== 'string') throw new Error('url is a string!');
      return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'));
    } catch (err) {
      console.log(util.format(err))
    };
  };

  getBuffer = async (url, options) => {
    try {
      options ? options : {}
      const res = await axios({
        method: "get",
        url,
        headers: {
          'DNT': 1,
          'Upgrade-Insecure-Request': 1
        },
        ...options,
        responseType: 'arraybuffer'
      })
      return res.data
    } catch (err) {
      return err
    }
  }

  async fetchJson(url, options = {}) {
    try {
      let data = await axios.get(url, {
        headers: {
          ...(!!options.headers ? options.headers : {}),
        },
        responseType: "json",
        ...options,
      });

      return await data?.data;
    } catch (e) {
      throw e;
    }
  }
  
  toPDF = (images, opt = {}) => {
    return new Promise(async (resolve, reject) => {
      if (!Array.isArray(images)) images = [images];
      let buffs = [],
        doc = new PDFDocument({ margin: 0, size: "A4" });
      for (let x = 0; x < images.length; x++) {
        if (/.webp|.gif/.test(images[x])) continue;
        let data = (
          await axios.get(images[x], { responseType: "arraybuffer", ...opt })
        ).data;
        doc.image(data, 0, 0, {
          fit: [595.28, 841.89],
          align: "center",
          valign: "center",
        });
        if (images.length != x + 1) doc.addPage();
      }
      doc.on("data", (chunk) => buffs.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffs)));
      doc.on("error", (err) => reject(err));
      doc.end();
    });
  }
   
  upload = async (buffer) => {
    const formData = new FormData();
    formData.append("file", buffer, {
      filename: Date.now() + ".jpg",
    });

    const response = await axios.post("https://hostfile.my.id/api/upload", formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    return response.data; 
  };

}