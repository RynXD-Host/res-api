const WebSocket = require("ws");
const axios = require('axios');
const { CharacterAi } = require("./CharacterAi/index")

const config = require("../../config.js")

function generateRandomLetters(length) {
  let result = ''
  const alphabetLength = 26

  for (let i = 0; i < length; i++) {
    const randomValue = Math.floor(Math.random() * alphabetLength)
    const randomLetter = String.fromCharCode('a'.charCodeAt(0) + randomValue)
    result += randomLetter
  }

  return result
}

class Prodia {
  constructor(apikey) {
    this.apikey = apikey;
  }

  async pollJobStatus(jobId) {
    let status = 'queued';

    while (status === 'queued' || status === 'generating') {
      try {
        const response = await axios.get(`https://api.prodia.com/job/${jobId}`, {
          headers: {
            'X-Prodia-Key': this.apikey,
            'accept': 'application/json',
          },
        });

        status = response.data.status;

        if (status === 'succeeded') {
          console.log(response.data);
        } else if (status === 'failed') {
          console.error('Job failed.');
        } else {
          console.log('Job status:', status);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before polling again
        }
      } catch (error) {
        console.error(error);
        break;
      }
    }
  }

  async generateImage(prompt, model, upscale, sampler, ratio) {
    try {
      const { data } = await axios.post('https://api.prodia.com/v1/sd/generate', {
        upscale: upscale,
        aspect_ratio: ratio,
        model: model,
        prompt: prompt,
        negative_prompt: 'badly drawn',
        style_preset: 'analog-film',
        steps: 25,
        cfg_scale: 7,
        seed: -1,
        sampler: sampler,
      }, {
        headers: {
          'X-Prodia-Key': this.apikey,
          'accept': 'application/json',
          'content-type': 'application/json',
        },
      });

      await this.pollJobStatus(data.job);
    } catch (error) {
      console.error(error);
    }
  }
}


class OpenAi {
  constructor(apikey) {
    this.apikey = apikey
  }

  chatGPT3 = async (messages) => {
    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apikey}`
        },
      })
      return response.data.choices[0].message.content;
    } catch (e) {
      console.error(e)
    }
  }
  
  chatGPT4 = async (text) => {
    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [
          { role: "system", content: "Ini Adalah Arifzyn API, Yang Di Ciptakan Oleh Arifzyn., Saya adalah model versi GPT-4, " },
          { role: 'user', content: text }
        ],
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apikey}`
        },
      })
      return response.data.choices[0].message.content;
    } catch (e) {
      console.error(e)
    }
  }
}

const CharAi = async (query, chark) => {
  return new Promise(async (resolve, reject) => {
    axios("https://boredhumans.com/api_celeb_chat.php", {
      headers: {
        "cookie": "boredHuman=2023-09-20; website-builder=2; adoptme_ck=f10961a8; ai-tools=1; code_generation=3; article-writer=2; text-to-image=1; research-paper=1; haiku=1; template=2",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
      },
      "data": "message=" + query + "&intro=" + chark + "&name=" + chark,
      "method": "POST"
    }).then((response) => {
      resolve(response.data.output);
    }).catch((error) => {
      reject(error);
    });
  });
};

const Speech = async (text, type) => {
  return new Promise(async (resolve, reject) => {
    const data = new FormData();
    data.append("locale", 'jv-ID')
    data.append("content", '<voice name="' + type + '"> ' + text + ' </voice>')
    data.append("ip", '103.105.35.83')
    const vyos = await axios({
      url: 'https://app.micmonster.com/restapi/create',
      method: 'POST',
      data: data,
      headers: {
        ...data.getHeaders()
      },
    }).catch(() => reject({ err: true }))
    let res = vyos.data
    resolve(res || 'err')
  })
}

class vitsSpeech {
  model = (number) => {
    return new Promise(async (resolve) => {
      const { data } = await axios.get("https://raw.githubusercontent.com/ArifzynXD/database/master/ai/anime.json")
      const model = data.model[number.toString()]

      if (model) {
        resolve(model)
      } else {
        resolve(data)
      }
    })
  }
  language = (id) => {
    return new Promise(async (resolve) => {
      const { data } = await axios.get("https://raw.githubusercontent.com/ArifzynXD/database/master/ai/anime.json")
      const lang = data.language[id.toString()]

      if (lang) {
        resolve(lang)
      } else {
        resolve(data)
      }
    })
  }
  generate = (text, model_id, language) => {
    return new Promise(async (resolve, reject) => {
      const model = await this.model(model_id)
      const lang = await this.language(language)

      const send_hash = {
        "session_hash": "4odx020bres",
        "fn_index": 2
      }
      const send_data = {
        "fn_index": 2,
        "data": [
        text,
        model,
        lang,
        1,
        false
      ],
        "session_hash": "4odx020bres"
      }
      const result = {}

      const ws = new WebSocket("wss://plachta-vits-umamusume-voice-synthesizer.hf.space/queue/join");

      ws.onopen = function() {
        console.log("Connected to websocket")
      };

      ws.onmessage = async function(event) {
        let message = JSON.parse(event.data);
        switch (message.msg) {
          case 'send_hash':
            ws.send(JSON.stringify(send_hash));
            break;
          case 'estimation':
            console.log('Menunggu antrean: ️' + message.rank)
            break;
          case 'send_data':
            console.log('Processing your audio....');
            ws.send(JSON.stringify(send_data));
            break;
          case 'process_completed':
            result.url = 'https://plachta-vits-umamusume-voice-synthesizer.hf.space/file=' + message.output.data[1].name
            break;
        }
      };

      ws.onclose = function(event) {
        if (event.code === 1000) {
          console.log('Process completed️');
        } else {
          console.log('Err : WebSocket Connection Error:\n');
        }
        resolve(result)
      };
    })
  }
}

const Instrument = async (audio) => {
  return new Promise(async (resolve, reject) => {
    let result = {}
    let name = Math.floor(Math.random() * 100000000000000000) + await generateRandomLetters() + '.mp4'
    let send_has_payload = { "fn_index": 0, "session_hash": "6inywdd0rtw" }
    let send_data_payload = {
      "data": [
        {
          "data": "data:audio/mpeg;base64," + audio.toString('base64'),
          "name": name
      }
    ],
      "event_data": null,
      "fn_index": 0,
      "session_hash": "6inywdd0rtw"
    }

    const ws = new WebSocket("wss://yanzbotz-instrument.hf.space/queue/join");
    ws.onopen = function() {
      console.log("Connected to websocket")
    };

    ws.onmessage = async function(event) {
      let message = JSON.parse(event.data);

      switch (message.msg) {
        case 'send_hash':
          ws.send(JSON.stringify(send_has_payload));
          break;

        case 'estimation':
          console.log('Menunggu antrean: ️' + message.rank)
          break;

        case 'send_data':
          console.log('Processing your audio....');
          ws.send(JSON.stringify(send_data_payload));
          break;
        case 'process_completed':
          result.vocal = 'https://yanzbotz-instrument.hf.space/file=' + message.output.data[0].name
          result.instrument = 'https://yanzbotz-instrument.hf.space/file=' + message.output.data[1].name
          break;
      }
    };

    ws.onclose = function(event) {
      if (event.code === 1000) {
        console.log('Process completed️');
      } else {
        console.log('Err : WebSocket Connection Error:\n');
      }
      resolve(result)
    };
  })
}

const aiCover = async (character, audio) => {
  return new Promise(async (resolve, reject) => {
    let result = {}
    let name = Math.floor(Math.random() * 100000000000000000) + await generateRandomLetters() + '.mp4'
    let characters = {
      "kobo": 2,
      "zeta": 0,
      "gura": 20,
      "kaela": 4,
      "pekora": 6,
      "miko": 8,
      "subaru": 10,
      "korone": 12,
      "luna": 14,
      "anya": 16,
      "reine": 18,
      "calli": 22,
      "kroni": 24
    }
    let getCharacter = characters[character]

    let send_has_payload = { "fn_index": getCharacter, "session_hash": "dtniinetjz6" }
    let send_data_payload = {
      "fn_index": getCharacter,
      "data": [
        {
          "data": "data:audio/mpeg;base64," + audio.toString('base64'),
          "name": name
		},
		0,
		"pm",
		0.6,
		false,
		"",
		"en-US-AnaNeural-Female"
		],
      "event_data": null,
      "session_hash": "dtniinetjz6"
    }

    const ws = new WebSocket("wss://yanzbotz-waifu-yanzbotz.hf.space/queue/join");
    ws.onopen = function() {
      console.log("Connected to websocket")
    };

    ws.onmessage = async function(event) {
      let message = JSON.parse(event.data);

      switch (message.msg) {
        case 'send_hash':
          ws.send(JSON.stringify(send_has_payload));
          break;

        case 'estimation':
          console.log('Menunggu antrean: ️' + message.rank)
          break;

        case 'send_data':
          console.log('Processing your audio....');
          ws.send(JSON.stringify(send_data_payload));
          break;
        case 'process_completed':
          result.base64 = 'https://yanzbotz-waifu-yanzbotz.hf.space/file=' + message.output.data[1].name
          break;
      }
    };

    ws.onclose = function(event) {
      if (event.code === 1000) {
        console.log('Process completed️');
      } else {
        console.log('Err : WebSocket Connection Error:\n');
      }
      resolve(result)
    };
  })
}

const upscale = async (image, size) => {
  return new Promise(async (resolve, reject) => {
    let result = {};
    let send_has_payload = {
      fn_index: 0,
      session_hash: "s3xzm2ie8hj",
    };

    let resolution = {
      low: "2x",
      medium: "4x",
      high: "8x",
    };
    let upTo = resolution[size];

    let send_data_payload = {
      data: [
        "data:image/jpeg;base64," + image.toString("base64"),
        upTo, // Kalau mau di ubah juga bisa jadi "8x", "4x", atau "2x"
      ],
      event_data: null,
      fn_index: 0,
      session_hash: "s3xzm2ie8hj",
    };

    const ws = new WebSocket("wss://doevent-face-real-esrgan.hf.space/queue/join");
    ws.onopen = function () {
      console.log("Connected to websocket");
    };

    ws.onmessage = async function (event) {
      let message = JSON.parse(event.data);

      switch (message.msg) {
        case "send_hash":
          ws.send(JSON.stringify(send_has_payload));
          break;

        case "send_data":
          console.log("Processing your image....");
          ws.send(JSON.stringify(send_data_payload));
          break;

        case "process_completed":
          result.base64 = message.output.data[0].replace(
            "data:image/png;base64,",
            "",
          );

          break;
      }
    };

    ws.onclose = function (event) {
      if (event.code === 1000) {
        console.log("Process completed️");
      } else {
        throw "Err : WebSocket Connection Error:\n";
      }
      resolve(result);
    };
  });
};
const imageToPrompt = (image) => {
  return new Promise(async (resolve, reject) => {
    let result = {}
    const send_hash = { "fn_index": 1, "session_hash": "tzet6g7gqhq" };
    const send_data = {
      "data": ["data:image/jpeg;base64," + image.toString('base64'), "fast"],
      "event_data": null,
      "fn_index": 3,
      "session_hash": "tga18lg3bbc"
    };

    const ws = new WebSocket("wss://pharmapsychotic-clip-interrogator.hf.space/queue/join");
    ws.onopen = function() {
      console.log("Connected to websocket");
    };
    ws.onmessage = async function(event) {
      const message = JSON.parse(event.data);

      switch (message.msg) {
        case "send_hash":
          ws.send(JSON.stringify(send_hash));
          break;
        case "estimation":
          console.log('Menunggu antrean: ' + message.rank);
          break;
        case "send_data":
          console.log("Proses Your data...");
          ws.send(JSON.stringify(send_data));
          break;
        case "process_completed":
          result.prompt = message.output.data;
          break;
      }
    };

    ws.onclose = function(event) {
      if (event.code === 1000) {
        console.log('Process completed');
      } else {
        console.error('Error: WebSocket Connection Error\n');
      }
      resolve(result);
    };
  });
};

const roboguru = async (pertayaan) => {
  return new Promise(async (resolve, reject) => {
    axios.get("https://roboguru.ruangguru.com/api/v3/roboguru-discovery/search/question?gradeSerial=3GAWQ3PJRB&subjectName=Bahasa%20Indonesia&withVideo=true&text=" + pertayaan + "&imageURL=&singleQuestion=false", {
      "headers": {
        "content-type": "application/json",
        "country": "id",
        "disable-node-proxy": "false",
        "platform": "web",
        "with-auth": "true",
        "cookie": "__rg_cookie_id__=5dfa07d3-b70d-4f55-9b87-de807d217c5a; role=student; isLoggedIn=false; _fbp=fb.1.1692430424111.1265232896; _ga=GA1.2.2016682901.1692430419; _ga_XXZDPTKN3B=GS1.2.1692481599.4.1.1692481627.0.0.0; _ga_CM5DLCK5E0=GS1.2.1692481599.4.1.1692481627.0.0.0; _ga_M3WCHJPBC6=GS1.2.1692481600.4.1.1692481627.33.0.0; _ga_2FWJ6H3WGT=GS1.2.1692481600.4.1.1692481627.33.0.0; _ga_MZNBZXV2VM=GS1.1.1692481597.4.1.1692481631.0.0.0; _ga_KGEN8KBRBW=GS1.1.1692481598.4.1.1692481631.0.0.0; _ga_EN706YSJ4M=GS1.1.1692481598.4.1.1692481631.27.0.0; __gads=ID=9b2f716c07448102:T=1692432625:RT=1692481639:S=ALNI_MYfgMGMtvKqXukFIr4bFzfDR9OkTw; __gpi=UID=00000c2f116e7701:T=1692432625:RT=1692481639:S=ALNI_Ma67IvFbfhGFxwYx5N_gFknJqEz1w; userID=user76G04RAHAKI1; __cf_bm=O5NIBn2hVeo8tkcyaTmFiVmy0p7rj1Lijw0QH4bpuwA-1694247717-0-AT5tS8p0iirsVJfVLkZ8aEEVZldFeZGTiYFvNQWbCro8siqBcNEY7c2M2ssbJtR1szNHsxtDYu//gnI5ycZX1EM=; _roboguruSession=29212bfe-65e6-460c-b416-d1634ac14640; __tracker_session_id__=ea0ef080-b5f1-473c-8fe7-2ac5276ea98f; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJydCI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpoYm05dUlqcDBjblZsTENKbGVIQWlPakUyT1RZNE16azNNalVzSW5Wdll5STZJblZ6WlhJM05rY3dORkpCU0VGTFNURWlMQ0p5SWpvaWMzUjFaR1Z1ZENJc0luUnZhMlZ1U1VRaU9pSXhOamt5TkRNd05EQTVOVGszT1RFeU1qUXdJbjAuaUFPVlFfWFB2MWdyVzY3WFRoWGc3YmdNNU9ZT2dMTklVUm9qWWVKaXkwOCIsImFub24iOnRydWUsImV4cCI6MTY5NDMzNDEyNSwidW9jIjoidXNlcjc2RzA0UkFIQUtJMSIsInIiOiJzdHVkZW50IiwidG9rZW5JRCI6IjE2OTI0MzA0MDk1OTc5MTIyNDAifQ.OT51MzlNFoVkudFB0RZz2bujaRRR4lWIdokagdG2EeY; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbm9uIjp0cnVlLCJleHAiOjE2OTY4Mzk3MjUsInVvYyI6InVzZXI3NkcwNFJBSEFLSTEiLCJyIjoic3R1ZGVudCIsInRva2VuSUQiOiIxNjkyNDMwNDA5NTk3OTEyMjQwIn0.iAOVQ_XPv1grW67XThXg7bgM5OYOgLNIURojYeJiy08; expireToken=1694333945000"
      }
    }).then(({ data }) => {
      let result = data.data.questions
      var azfir = result[Math.floor(Math.random() * (result.length))]
      let hasil = azfir.contentDefinition
      resolve(hasil)
    })
  })
}

async function ChatGPT(question) {
  const requestData = {
    question,
    chat_id: '657f0f9e6b14a14965213159',
    timestamp: 1702825897544
  };

  let combinedContent = ''; 
  
  try {
    const response = await axios.post("https://chat.chatgptdemo.net/chat_api_stream", requestData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://chat.chatgptdemo.net/'
      },
      responseType: 'stream'
    });

    await new Promise((resolve, reject) => {
      response.data.on('data', chunk => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        lines.forEach(line => {
          const match = line.match(/"content":\s*"([^"]*)"/);
          if (match) {
            combinedContent += match[1]
          }
        });
      });

      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  } catch (error) {
    console.error(error.message);
  }

  return combinedContent.trim(); 
} 

exports.ai = {
  prodia: new Prodia(config.api.prodia),
  openai: new OpenAi(config.api.openai),
  vits: new vitsSpeech(),
  characterai: CharAi,
  speech: Speech,
  instrument: Instrument,
  coverAi: aiCover,
  characterAi: CharacterAi,
  upscale: upscale,
  imageToPrompt,
  robo: roboguru,
  ChatGPT,
}