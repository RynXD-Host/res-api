const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BING_URL = process.env.BING_URL || 'https://www.bing.com';
const randomIPComponent = () => Math.floor(Math.random() * 256);
const FORWARDED_IP = `13.${randomIPComponent()}.${randomIPComponent()}.${randomIPComponent()}`;
const HEADERS = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'max-age=0',
  'content-type': 'application/x-www-form-urlencoded',
  'referrer': 'https://www.bing.com/images/create/',
  'origin': 'https://www.bing.com',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63',
  'x-forwarded-for': FORWARDED_IP,
};

const error_timeout = 'Your request has timed out.';
const error_redirect = 'Redirect failed';
const error_blocked_prompt = 'Your prompt has been blocked by Bing. Try to change any bad words and try again.';
const error_being_reviewed_prompt = 'Your prompt is being reviewed by Bing. Try to change any sensitive words and try again.';
const error_noresults = 'Could not get results';
const error_unsupported_lang = '\nthis language is currently not supported by bing';
const error_bad_images = 'Bad images';
const error_no_images = 'No images';
const sending_message = 'Sending request...';
const wait_message = 'Waiting for results...';
const download_message = '\nDownloading images...';

class ImageGen {
  constructor(auth_cookie, auth_cookie_SRCHHPGUSR, debug_file = null, quiet = false, all_cookies = null) {
    this.auth_cookie = auth_cookie;
    this.auth_cookie_SRCHHPGUSR = auth_cookie_SRCHHPGUSR;
    this.session = axios.create({
      headers: HEADERS,
      maxRedirects: 0,
    });
    this.session.defaults.maxRedirects = 0;
    this.session.defaults.validateStatus = status => status === 302 || (status >= 200 && status < 300);
    this.session.defaults.withCredentials = true;
    this.session.defaults.transformResponse = [data => data];
    this.session.defaults.validateStatus = null;
    this.session.defaults.responseEncoding = 'utf8';
    this.session.defaults.responseType = 'text';
    this.session.defaults.validateStatus = null;
    this.session.defaults.timeout = 5000;
    this.session.defaults.headers.common['Cookie'] = `_U=${auth_cookie}; SRCHHPGUSR=${auth_cookie_SRCHHPGUSR}`;
    if (all_cookies) {
      for (const cookie of all_cookies) {
        this.session.defaults.headers.common['Cookie'] += `; ${cookie.name}=${cookie.value}`;
      }
    }
    this.quiet = quiet;
    this.debug_file = debug_file;
    if (this.debug_file) {
      this.debug = (text_var) => {
        fs.appendFileSync(this.debug_file, `${text_var}\n`, 'utf-8');
      };
    }
  }

  async get_images(prompt) {
    if (!this.quiet) {
      console.log(sending_message);
    }
    if (this.debug_file) {
      this.debug(sending_message);
    }
    const url_encoded_prompt = encodeURIComponent(prompt);
    const payload = `q=${url_encoded_prompt}&qs=ds`;
    let url = `${BING_URL}/images/create?q=${url_encoded_prompt}&rt=4&FORM=GENCRE`;
    let response;
    try {
      response = await this.session.post(url, payload);
    } catch (error) {
      console.error(error);
    }
    if (response.data.toLowerCase().includes('this prompt is being reviewed')) {
      if (this.debug_file) {
        this.debug(`ERROR: ${error_being_reviewed_prompt}`);
      }
      throw new Error(error_being_reviewed_prompt);
    }
    if (response.data.toLowerCase().includes('this prompt has been blocked')) {
      if (this.debug_file) {
        this.debug(`ERROR: ${error_blocked_prompt}`);
      }
      throw new Error(error_blocked_prompt);
    }
    if (response.data.toLowerCase().includes("we're working hard to offer image creator in more languages")) {
      if (this.debug_file) {
        this.debug(`ERROR: ${error_unsupported_lang}`);
      }
      throw new Error(error_unsupported_lang);
    }
    if (response.status !== 302) {
      url = `${BING_URL}/images/create?q=${url_encoded_prompt}&rt=3&FORM=GENCRE`;
      try {
        response = await this.session.post(url, payload);
      } catch (error) {
        console.error(error);
      }
      if (response.status !== 302) {
        if (this.debug_file) {
          this.debug(`ERROR: ${error_redirect}`);
        }
        console.log(`ERROR: ${response.data}`);
        throw new Error(error_redirect);
      }
    }
    const redirect_url = response.headers['location'].replace('&nfy=1', '');
    const request_id = redirect_url.split('id=')[1];
    await this.session.get(`${BING_URL}${redirect_url}`);
    const polling_url = `${BING_URL}/images/create/async/results/${request_id}?q=${url_encoded_prompt}`;
    if (this.debug_file) {
      this.debug('Polling and waiting for result');
    }
    if (!this.quiet) {
      process.stdout.write(wait_message);
    }
    const start_wait = Date.now();
    while (true) {
      if (Date.now() - start_wait > 360000) {
        if (this.debug_file) {
          this.debug(`ERROR: ${error_timeout}`);
        }
        throw new Error(error_timeout);
      }
      if (!this.quiet) {
        process.stdout.write('.');
      }
      try {
        response = await this.session.get(polling_url);
      } catch (error) {
        console.error(error);
      }
      if (response.status !== 200) {
        if (this.debug_file) {
          this.debug(`ERROR: ${error_noresults}`);
        }
        throw new Error(error_noresults);
      }
      if (!response.data || response.data.includes('errorMessage')) {
        await sleep(1000);
      } else {
        if (this.debug_file) {
          this.debug('done');
        }
        console.log("\ndone")
        break;
      }
    }
    const image_links = response.data.match(/src="([^"]+)"/g).map(match => match.match(/src="([^"]+)"/)[1]);
    const normal_image_links = image_links.map(link => link.split('?w=')[0]);
    const unique_image_links = [...new Set(normal_image_links)];
    const bad_images = [
      'https://r.bing.com/rp/in-2zU3AJUdkgFe7ZKv19yPBHVs.png',
      'https://r.bing.com/rp/TX9QuO3WzcCJz1uaaSwQAz39Kb0.jpg',
    ];
    for (const img of unique_image_links) {
      if (bad_images.includes(img)) {
        throw new Error(error_bad_images);
      }
    }
    if (unique_image_links.length === 0) {
      throw new Error(error_no_images);
    }
    return unique_image_links;
  }

  async save_images(links, output_dir, file_name = null, download_count = null) {
    if (this.debug_file) {
      this.debug(download_message);
    }
    if (!this.quiet) {
      console.log(download_message);
    }
    if (!fs.existsSync(output_dir)) {
      fs.mkdirSync(output_dir, { recursive: true });
    }
    let fn = file_name ? `${file_name}_` : '';
    let jpeg_index = 0;
    if (download_count) {
      links = links.slice(0, download_count);
    }
    for (const link of links) {
      while (fs.existsSync(path.join(output_dir, `${fn}${jpeg_index}.jpeg`))) {
        jpeg_index++;
      }
      let response;
      try {
        response = await this.session.get(link, { responseType: 'arraybuffer' });
      } catch (error) {
        console.error(error);
      }
      if (response.status !== 200) {
        throw new Error('Could not download image');
      }
      fs.writeFileSync(path.join(output_dir, `${fn}${jpeg_index}.jpeg`), response.data);
      jpeg_index++;
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function pickRandom(list) {
	return list[Math.floor(list.length * Math.random())]
}

const Cookie = [
  "141LgR5XxUZUuxbtgMPMiEhKLbsZJP9iYPEM06rbfmXA1cMGq-DKw2dY9huuyALD8FOCCd7R7OQKtNszS-em2ldcle33hmInxGqwhwb1tDQIEY9K9J4MiOTnrbzEIB4I03AAlZSJ-ylzCCEuzbG4G8Mo2KVNWCpLmRq9F2AzLTFIdRT-rqhAgOq--ui0MahZ-woaXS2k1VVK-F9i6lqsltg",
  "1I_6mYYdV7Bx1lXhHZpCppYY1VR6JPO4K5-ePx2qoDDJNn9EqapEztlB9b164IQKSLRuoMMbRv3poUYmOzrAs7m0E3kKQ22_0cfgTkYbsW4a-khPGasF7_8XjoAsLF12lNpH7HsjLJyED7-_mCMdKwCcJ8zr3MHFclMlfzVPwx17oZiMUJ7RE8hEKPzo9Xv2u-HuVuu2wCLDkYpt7FzBt1g",
  "1bzKu0aqm9nRLfbaw8AvLk-iejnX1I8ETmdcugb6-VCVCDCQcRhhuhWRQFf1x2zneG_RBpm8Bmn6yc3zxLLVvJYSXyvvBwnZzkMoyGziqpxBK18VNxdPhIrMe9RagIB1-r9lT8YSxQuaH5lTC3Lo35gfauNZNBt6XQC7AumsgaLL5PgYsYb1jHDEmKFBZV2qgwNAl621vfgD8ph-2GWFeY9N2Sqrf5otBL6o08qe3n1w"
]  

const api = [
  "1XFEEQYrlmw_VqzpqKQ_ad0TAQ0JUeYdxxPDgwM3mrPcLGroA7zl-PAGZULYG3hBIye2JJfRWTtK92mEg9S3V2fJvvmPM6VoR4TNEq1YdzIrF2AgO7-AMGrBiDV54T1xEwkFszdb9T7HQvBtm3B6mkBhX3Cz0q8erUppVSaDKi00RJKPIIR7W7GAEa5xxa7lhDJU1EjKOiYmEeA1M8IgciGsPHcgiY74MvdqB2yB0ixg",
  "1vQzC05JWeJ0ghWMCkYcEAyqcpR-v9bpdM5isqlj0CWikP4zfNjHw3osExiC4T-FYOm4ZBRJ2MA7JntSURfq3NV-gVcNtfDiXhJJMJsbWr-GPkONsr7QGUeJc8cws6uz9exoClk7H5cROt6Fn3MynhIoTKS2iX_BqXlLSDnhs9X9Zw7DEY66JsE_LIcwWNastiGPgi7zgBjpwxuMhNxP3ww",
]
 
const cookie = Cookie[Math.floor(Cookie.length * Math.random())]

const imageGen = new ImageGen("1XFEEQYrlmw_VqzpqKQ_ad0TAQ0JUeYdxxPDgwM3mrPcLGroA7zl-PAGZULYG3hBIye2JJfRWTtK92mEg9S3V2fJvvmPM6VoR4TNEq1YdzIrF2AgO7-AMGrBiDV54T1xEwkFszdb9T7HQvBtm3B6mkBhX3Cz0q8erUppVSaDKi00RJKPIIR7W7GAEa5xxa7lhDJU1EjKOiYmEeA1M8IgciGsPHcgiY74MvdqB2yB0ixg", "SRCHLANG=id&IG=6A25B7B2A1A04AF6A63AEA6C057E6F91&PV=11.0.0&DM=1&CW=499&CH=946&SCW=499&SCH=946&BRW=MW&BRH=MT&DPR=1.4&UTC=420&HV=1701761488&WTS=63837351581&THEME=1&PRVCW=1153&PRVCH=946&HBOPEN=2");

exports.bingimg = async (prompt) => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageLinks = await imageGen.get_images(prompt);
      resolve(imageLinks.map(url => url.replace(/\.svg$/, '')));
    } catch (error) { 
      reject('Prompt di banned');
    }
  })
}

const getAModel = (model) => {
  return new Promise((resolve, reject) => {
    const models = {
    	"precise": "precise",
    	"balanced": "balanced",
    	"creative": "creative"
    }
    const modelList = [];
    
    for (const key in models) {
      if (models.hasOwnProperty(key)) {
        const simplifiedKey = key.split(' ')[0];
        modelList.push(simplifiedKey);
      }
    }
    let txt = `[!] Model *${model}* Not Found\n\nList Model :\n`
    modelList.forEach((a, b) => {
      txt += `${b}. ${a}\n`
    })
    if (!models[model]) resolve(txt)
    const arr = models[model]
    resolve(arr)
    console.log(arr)
  })
}

exports.bing = async (prompt, model) => {
  return new Promise(async (resolve, reject) => {
    try {
      const models = await getAModel(model)
      const response = await axios.post("https://copilot.github1s.tk/v1/chat/completions", {
        "model": models,
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant."
        },
          {
            "role": "user",
            "content": prompt
        }
      ]
      })
      resolve(response.data.choices[0].message.content)
    } catch (error) {
      console.error("Error in Bing:", error.message);
      throw error;
    }
  })
}
