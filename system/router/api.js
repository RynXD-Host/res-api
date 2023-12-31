const express = require("express");
const multer = require('multer');
const fs = require("fs"); 
const path = require("path");
const uuid = require('uuid');
const ytdl = require('ytdl-core');

const router = express.Router();
const config = require("../../config");
const scraper = require("../scraper/index");
const Function = require("../lib/function")
const { db } = require("../lib/database");

const Func = new Function()
const Bard = require("ai-bard")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { resSukses, resValid, deleteFile } = Func  
 

const checkApiKey = async (req, res, next) => {
  const apiKey = req.query.apikey

  if (!apiKey) return res.json(resValid("Masukan Parameter Apikey."));
  
  try {
    const user = await db.findOne({ apikey: apiKey });

    if (!user) {
      return res.json(resValid(`Invalid API key "${apiKey}"`)); 
    }
    
    if (!user.premium) {
      if (user.limit > 0) {
        await db.updateOne({ apikey: apiKey }, { $inc: { limit: -1 } });
      } else {
        return res.json(resValid("Limit kamu sudah habis."));
      }
    }
    
    next();
  } catch (error) {
  	console.log(error)
      return res.json(config.msg.error);
  }
};

function saveFileURL(buffer, folderPath, req) {
  const uniqueFileName = `${uuid.v4()}.jpg`;
  const filePath = path.join(folderPath, uniqueFileName);
  
  fs.writeFileSync(filePath, buffer)
  
  setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
          } else {
            console.log(`File deleted successfully: ${filePath}`);
          }
        });
      }, 5 * 60 * 1000); 
      
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/file/${uniqueFileName}`;
}


router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename; 
  
  if (filename) {
    const filePath = path.join(__dirname, '../tmp', filename);
    res.sendFile(filePath); 
  } else {
    res.status(400).json(resValid("File Not Found"));
  }
});

router.get("/ai/azureGPT", checkApiKey, async (req, res) => {
  const text = req.query.text
  if (!text) return res.json(config.msg.text)
  
  const azure = async (query) => {
    const messages = [{
        role: 'system',
        content: 'Kamu adalah Arifzyn, dan kamu memiliki sifat agak toxic,kamu berumur 18 tahun dan bersekolah di sekolah menengah atas,kamu type pria yang disukai banyak cewek cantik,kamu juga owner Web https://api.arifzyn.biz.id.'
    }, {
        role: 'user',
        content: query
    }];
    const response = await Func.fetch('https://oai-4.openai.azure.com/openai/deployments/complete-4/chat/completions?api-version=2023-07-01-preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': '2e6532692d764b48b5454f0f4abf8c81'
        },
        body: JSON.stringify({
            messages
        }),
    });
    const data = await response.json();
    return data;
}
  try {
    const result = await azure(text)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/ai/chatGPT3", checkApiKey, async (req, res) => {
  const text = req.query.text
  if (!text) return res.json(config.msg.text)
  
  try {
    const result = await scraper.ai.ChatGPT(text)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.post("/ai/chatGPT3", checkApiKey, async (req, res) => {
	const { messages } = req.body
	if (!messages) return res.json(config.msg.param)
	
	try {
		const result = await scraper.ai.openai.chatGPT3(messages)
		res.json(resSukses(result))
	} catch (e) {
		console.error(e)
		res.json(config.msg.error)
	}
})

router.get("/ai/VoiceGPT", checkApiKey, async (req, res) => {
	const { text } = req.query
	if (!text) return res.json(config.msg.text)
	
	try {
		const messages = [
		  { role: "system", content: "Aku adalah Arif, sifat ku pemarah suka toksik" },
		  { role: 'user', content: text }
        ]
		const result = await scraper.ai.openai.chatGPT3(messages)
		const voice = await scraper.tools.speech(result, "id-ID-ArdiNeural") 
		const buffer = Buffer.from(voice, "base64")
		res.type("mp3").send(buffer)
	} catch (e) {
		console.error(e)
		res.json(config.msg.error)
	}
})

router.post("/ai/bard", checkApiKey, upload.single("image"), async (req, res) => {
  const images = req.file ? req.file.buffer : undefined;
  const { text } = req.body
  if (!text) return res.json(config.msg.text)
  
  const bard = new Bard("eAiWK6p41lPKtsyqTAsfcElpZlSLAYRPQVn_xsRHs7NFlXtcDQCzihdxpR_Fr8joP8qVKg.")
  
  let response
  try {
    if (images) {
    	response = await bard.ask(text, { image: images })
    } else {
    	response = await bard.ask(text)
    }
    res.json(resSukses(response))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/ai/bingimg", checkApiKey, async (req, res) => {
  const text = req.query.prompt
  if (!text) return res.json(resValid("Masukan Parameter Prompt."))
  
  const { bingimg } = require("../scraper/bing")
  
  try {
    const result = await bingimg(text)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/ai/bing", checkApiKey, async (req, res) => {
  const text = req.query.text
  if (!text) return res.json(config.msg.text)
  
  const { bing } = require("../scraper/bing")
  
  try {
    const result = await bing(text)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/ai/gemini", checkApiKey, async (req, res) => {
  const text = req.query.text
  if (!text) return res.json(config.msg.text)
  
  const gemini = new (require("../scraper/gemini"))(config.api.gemini)

  try {
    const chat = await gemini.createChat();	
    const result = await chat.ask(text)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/ai/characterai", checkApiKey, async (req, res) => {
  const text = req.query.text
  const chark = req.query.chara
  if (!text) return res.json(config.msg.text)
  if (!chark) return res.json(resValid("Masukan Parameter Character."))
  
  try {
  	const response = await scraper.ai.characterai(text)
      res.json(resSukses(response))
  } catch (e) {
      console.error(e)
      res.json(config.msg.error)
  }
  
})

router.post("/ai/vits", async (req, res) => {
	const { text, model_id, lang } = req.body
	if (!text || !model_id || !lang) return res.json(config.msg.param)
	
	try {
		const response = await scraper.ai.vits.generate(text, model_id, lang)
		const buffer = await Func.getBuffer(response.url)
		
		res.json(resSukses(buffer.toString("base64")))
    } catch (e) {
      console.error(e)
      res.json(config.msg.error)
    }
}) 

router.get("/ai/vits/model", async (req, res) => {
	try {
		const { data } = await Func.axios.get("https://raw.githubusercontent.com/ArifzynXD/database/master/ai/anime.json")
		const response = Object.entries(data.model).map(([modelId, horseName]) => ({
			model_id: parseInt(modelId),
			character: horseName,
		}));
		res.json(resSukses(response))
	} catch (e) {
      console.error(e)
      res.json(config.msg.error)
    }
})

router.get("/ai/cai/search", checkApiKey, async (req, res) => {
	const { query } = req.query
	if (!query) return res.json(config.msg.query)
	
	const { CharacterAi } = require("../scraper/CharacterAi/index")
	
	try {
		let response = await CharacterAi.searchCharacter(query)
		
		if (response.length == 0) return res.json(resValid("Character Not found."))
		
		response = response.characters.map((v) => {
			return {
				name: v.participant__name,
				id: v.external_id,
				greeting: v.greeting,
				score: v.search_score
			}
		})
		
		res.json(resSukses(response))
	} catch (e) {
      console.error(e)
      res.json(config.msg.error)
    }
})

router.get("/ai/cai/chat", checkApiKey, async (req, res) => {
	const { character_id, message } = req.query
	if (!character_id) return res.json(resValid("Input Parameter characte_id"))
	if (!message) return res.json(resValid("Input Parameter characte_id"))
	
	const { CharacterAi } = require("../scraper/CharacterAi/index")
	
	try {
		const chat = await CharacterAi.createChat(character_id)
		const response = await chat.send(message)
		
		res.json(resSukses(response.replies[0].text))
	} catch (e) {
      console.error(e)
      res.json(config.msg.error)
    }
})

router.post("/ai/cai/chat", checkApiKey, async (req, res) => {
	const { character_id, chatId, message } = req.body
	if (!character_id) return res.json(resValid("Input Parameter character_id"))
	if (!chatId) return res.json(resValid("Input Parameter chatId"))
	if (!message) return res.json(resValid("Input Parameter characte_id"))
	
	const { CharacterAi } = require("../scraper/CharacterAi/index")
	
	try {
		const chat = await CharacterAi.createChat(character_id, chatId)
		const response = await chat.send(message)
		
		res.json(resSukses(response.replies[0].text))
	} catch (e) {
      console.error(e)
      res.json(config.msg.error)
    }
})


router.get("/ai/cai/createChat", checkApiKey, async (req, res) => {
	const { character_id } = req.query
	if (!character_id) return res.json(resValid("Input Parameter characte_id"))
	
	const { CharacterAi } = require("../scraper/CharacterAi/index")
	
	try {
		const response = await CharacterAi.createChatId(character_id)
		const result = {
			chatId: response.external_id,
			created: response.created
		}
		res.json(resSukses(result))
	} catch (e) {
      console.error(e)
      res.json(config.msg.error)
    }
})

router.get("/ai/you", checkApiKey, async (req, res) => {
	const query = req.query.query;
	if (!query) return res.json(config.msg.query)
	
	const { you } = require("../scraper/youai")
	
	try {
		const response = await you(query)
		res.json(resSukses(response))
	} catch (e) {
		console.error(e)
		res.json(config.msg.error)
	}
})

router.get("/ai/upscale", checkApiKey, async (req, res) => {
	const { image, size } = req.query
	if (!image) return res.json(resValid("Masukan Parameter image, url"))
	if (!size) return res.json(resValid("Masukan Parameter Size, low, high, medium"))
	
	try {
		const buffer = await Func.getBuffer(image)
		const { base64 } = await scraper.ai.upscale(buffer, size)
		res.json(resSukses(base64))
	} catch (e) {
		console.error(e)
		res.json(config.msg.error)
	}
})

router.post("/ai/upscale", checkApiKey, upload.single("image"), async (req, res) => {
	const image = req.file.buffer
	if (!image) return res.json(resValid("Image Only Buffer"))
	const { size } = req.body
	if (!size) return res.json(resValid("Masukan Parameter Size, low, high, medium"))
	
	try {
		const { base64 } = await scraper.ai.upscale(image, size)
		const buffer = Buffer.from(base64, "base64")
		const url = await saveFileURL(buffer, path.join(__dirname, '../tmp'), req);
		res.json(resSukses(url))
	} catch (e) {
		console.error(e) 
		res.json(config.msg.error)
	}
})

router.post("/ai/image2prompt", checkApiKey, upload.single("image"), async (req, res) => {
	const image = req.file.buffer
	if (!image) return res.json(resValid("Image Only Buffer"))
	
	try { 
		const response = await scraper.ai.imageToPrompt(image)
		res.json(resSukses(response))
	} catch (e) { 
		console.error(e)
		res.json(config.msg.error)
	}
})

router.get("/ai/txt2img", checkApiKey, async (req, res) => {
	const { prompt, model } = req.query
	
	if (!prompt) return res.json(resValid("Masukan Parameter prompt."))
	if (!model) return res.json(resValid("Masukan Parameter model."))
	try {
	  const json = JSON.parse(fs.readFileSync("system/tmp/data/model.json"))
	  const models = json[model]
	  if (!models) {
	  	return res.json({
	  		creator: config.options.creator,
	  		status: 500,
	  		message: `Model ${model} Not Found`,
	  		model: Object.keys(json)
	  	})
	  }
	  const { data } = await Func.axios.post('https://app.arifzyn.xyz/generate', {
	  	prompt: prompt,
	  	negative_prompt: '3d, cartoon, anime, (deformed eyes, nose, ears, nose), bad anatomy, ugly',
	  	model: models,
	  	steps: 25,
	  	sampler: 'DPM++ 2M Karras',
	  	cfg_scale: 7,
	  	width: 512,
	  	height: 512,
	  	seed: -1,
	  })
	  const buffer = await Func.getBuffer(data.imageUrl)
	  
	  const url = saveFileURL(buffer, path.join(__dirname, '../tmp'), req);
	  return res.json(resSukses(url))
	} catch (e) { 
		console.error(e)
		res.json(config.msg.error)
	}
})

router.get("/anime/komiku/:action", async (req, res) => {
	const action = req.params.action;
	
	if (action === 'latest') {
		try {
			const response = await scraper.anime.komiku.latest()
			res.json(resSukses(response))
		} catch (e) {
			console.error(e)
			res.json(config.msg.error)
        }
	} else if (action === 'search') {
		const query = req.query.query;
		if (!query) return res.json(config.msg.query)
		
		try {
			const response = await scraper.anime.komiku.search(query)
			res.json(resSukses(response))
		} catch (e) {
			console.error(e)
			res.json(config.msg.error)
        }
	} else if (action === 'detail') {
		const url = req.query.url;
		if (!url) return res.json(config.msg.url)
		
		try {
			const response = await scraper.anime.komiku.detail(url)
			res.json(resSukses(response))
		} catch (e) {
			console.error(e)
			res.json(config.msg.error)
        }
	} else if (action === 'chapter') {
		const url = req.query.url;
		if (!url) return res.json(config.msg.url)
		
		try {
			const response = await scraper.anime.komiku.getChapter(url)
			const image = response.images.map((v) => v.url);
			const pdf = await Func.toPDF(image);
			
			const pdfFileName = response.title + '.pdf';
			const pdfFilePath = path.join(__dirname, '../tmp', pdfFileName);
			fs.writeFileSync(pdfFilePath, pdf);
			
			const hostUrl = `${req.protocol}://${req.get('host')}`;
			const fileUrl = `${hostUrl}/file/${encodeURIComponent(pdfFileName)}`;
			
			res.json(
			  resSukses({
			  	title: response.title, 
			  	url: fileUrl
			  })
			)
			
			await deleteFile(pdfFilePath)
			
		} catch (e) {
			console.error(e)
			res.json(config.msg.error)
        }
	} else {
		res.json(resValid("Action Valid."))
	}
		
})

router.get("/anime/doujindesu/:action", async (req, res) => {
	const action = req.params.action;
	
	try {
		let response;

		switch (action) {
			case "latest":
				response = await scraper.anime.doujindesu.latest();
				break;
			case "search":
				const query = req.query.query;
				if (!query) return res.json(config.msg.query);
				response = await scraper.anime.doujindesu.search(query);
				break;
			case "detail":
				const url = req.query.url;
				if (!url) return res.json(config.msg.url);
				response = await scraper.anime.doujindesu.detail(url);
				break;
			default:
				return res.json(config.msg.error);
		}

		res.json(resSukses(response));
	} catch (e) {
		console.error(e);
		res.json(config.msg.error);
	}
});

router.get("/anime/komikcast/:action", async (req, res) => {
	const action = req.params.action;
	const query = req.query.query;
	const url = req.query.url;
	
	try {
		let response;

		switch (action) {
			case "latest":
				response = await scraper.anime.komikcast.latest();
				break;
			case "search":
				if (!query) return res.json(config.msg.query);
				response = await scraper.anime.komikcast.search(query);
				break;
			case "detail":
			    
				if (!url) return res.json(config.msg.url);
				response = await scraper.anime.komikcast.detail(url);
				break;
			case "chapter":
				if (!url) return res.json(config.msg.url);
			    response = await scraper.anime.komikcast.chapter(url)
			    
			    break 
			default:
				return res.json(config.msg.error);
		}

		res.json(resSukses(response));
	} catch (e) {
		console.error(e);
		res.json(config.msg.error);
	}
});

router.get("/anime/kusonime/:action", async (req, res) => {
	const action = req.params.action;
	
	try {
		let response;

		switch (action) {
			case "search":
				const query = req.query.query;
				if (!query) return res.json(config.msg.query);
				response = await scraper.anime.kusonime.search(query);
				break;
			case "detail":
				const url = req.query.url;
				if (!url) return res.json(config.msg.url);
				response = await scraper.anime.kusonime.detail(url);
				break;
			default:
				return res.json(config.msg.error);
		}

		res.json(resSukses(response));
	} catch (e) {
		console.error(e);
		res.json(config.msg.error);
	}
});

router.get("/anime/nekopoi/:action", async (req, res) => {
	const action = req.params.action;
	
	try {
		let response;

		switch (action) {
			case "latest":
				response = await scraper.anime.nekopoi.latest();
				break;
			case "search":
				const query = req.query.query;
				if (!query) return res.json(config.msg.query);
				response = await scraper.anime.nekopoi.search(query);
				break;
			case "detail":
				const url = req.query.url;
				if (!url) return res.json(config.msg.url);
				response = await scraper.anime.nekopoi.detail(url);
				break;
			default:
				return res.json(config.msg.error);
		}

		res.json(resSukses(response));
	} catch (e) {
		console.error(e);
		res.json(config.msg.error);
	}
});

router.get("/anime/nhentai/:action", async (req, res) => {
	const action = req.params.action;
	const query = req.query.query;
	const id = req.query.id;
	
	try {
		let response;

		switch (action) {
			case "latest":
				response = await scraper.anime.nhentai.latest();
				break;
			case "search":
				if (!query) return res.json(config.msg.query);
				response = await scraper.anime.nhentai.search(query);
				break;
			case "detail":
				if (!id) return res.json(config.msg.id);
				response = await scraper.anime.nhentai.get(id);
				break;
		    case "pdf":
				if (!id) return res.json(config.msg.id);
				const nhentai = await scraper.anime.nhentai.get(id);
				const pdf = await Func.toPDF(nhentai.pages, {
					headers: {
			  		"user-agent": "Mozilla/5.0 (Linux; Android 11; RMX3261) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36"
			        },
				});
				
				const fileName = nhentai.title + '.pdf'
				const pdfFilePath = path.join(__dirname, '../tmp', fileName);
				fs.writeFileSync(pdfFilePath, pdf);
				
				const hostUrl = `${req.protocol}://${req.get('host')}`;
				const fileUrl = `${hostUrl}/file/${encodeURIComponent(fileName)}`;
				
				response = {
			  	  title: nhentai.title, 
			  	  url: fileUrl,
			  	  message: "Note: File Akan Di Hapus Setelah 5 Menit."
			    }
				
				await deleteFile(pdfFilePath)
		    break
			default:
				return res.json(config.msg.error);
		}

		res.json(resSukses(response));
	} catch (e) {
		console.error(e);
		res.json(config.msg.error);
	}
});

router.get("/anime/oploverz/:action", async (req, res) => {
	const action = req.params.action;
	const query = req.query.query;
	const url = req.query.url;
	
	try {
		let response;

		switch (action) {
			case "latest":
				response = await scraper.anime.oploverz.latest();
				break;
			case "search":
				if (!query) return res.json(config.msg.query);
				response = await scraper.anime.oploverz.search(query);
				break;
			case "detail":
				if (!url) return res.json(config.msg.url);
				response = await scraper.anime.oploverz.detail(url);
				break;
			default:
				return res.json(config.msg.error);
		}

		res.json(resSukses(response));
	} catch (e) {
		console.error(e);
		res.json(config.msg.error);
	}
});



router.get("/download/tiktok", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.tiktok(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/instagram", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.igdl(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/facebook", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.facebook(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/pinterest", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.download.pinterest(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/snackvideo", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.snackVideo(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/like", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.LikeDown(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/cocofun", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.cocofun(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/capcut", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.capcut(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/sfiledown", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.sfiledown(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/gdrivedl", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.GDriveDl(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/krakenfiles", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.krakenfiles(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/douyin", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.douyin(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/youtube", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  const { YouTube } = require("../scraper/youtube")
  
  try {
    const result = await YouTube(url) 
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/ytmp4", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.youtube.ytMp3(url) 
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/ytmp3", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.youtube.ytMp3(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/ytplay", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.youtube.ytPlay(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/download/ytplayvid", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.youtube.ytPlayVid(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get('/youtube/mp3', async (req, res, next) => {
        try {
                var url = req.query.url;
                if(!ytdl.validateURL(url)) {
                        return res.sendStatus(400);
                }
                let title = 'audio';

                await ytdl.getBasicInfo(url, {
                        format: 'mp4'
                }, (err, info) => {
                        if (err) throw err;
                        title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "");
                });

                res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
                ytdl(url, {
                        format: 'mp3',
                        filter: 'audioonly',
                }).pipe(res);

        } catch (err) {
                console.error(err);
        }
});

router.get('/youtube/mp4', async (req, res, next) => {
        try {
                let url = req.query.url;
                if(!ytdl.validateURL(url)) {
                        return res.sendStatus(400);
                }
                let title = 'video';

                await ytdl.getBasicInfo(url, {
                        format: 'mp4'
                }, (err, info) => {
                        title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "");
                });

                res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
                ytdl(url, {
                        format: 'mp4',
                }).pipe(res);

        } catch (err) {
                console.error(err);
        }
});

router.get("/download/terabox", checkApiKey, async (req, res) => {
  const url = req.query.url
  if (!url) return res.json(config.msg.url)
  
  try {
    const result = await scraper.download.terabox(url)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/stalk/instagram", checkApiKey, async (req, res) => {
  const user = req.query.username
  if (!user) return res.json(config.msg.user)
  
  try {
    const result = await scraper.stalk.instagram(user)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})



router.get("/stalk/tiktok", checkApiKey, async (req, res) => {
  const user = req.query.username
  if (!user) return res.json(config.msg.user)
  
  try {
    const result = await scraper.stalk.tiktok(user)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/stalk/github", checkApiKey, async (req, res) => {
  const user = req.query.username
  if (!user) return res.json(config.msg.user)
  
  try {
    const result = await scraper.stalk.github(user)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/stalk/twetter", checkApiKey, async (req, res) => {
  const user = req.query.username
  if (!user) return res.json(config.msg.user)
  
  try {
    const result = await scraper.stalk.twetter(user)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/stalk/npm", checkApiKey, async (req, res) => {
  const user = req.query.pkg
  if (!user) return res.json(resValid("Masukan Parameter PKG."))
  
  try {
    const result = await scraper.stalk.npm(user)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/stalk/freefire", checkApiKey, async (req, res) => {
  const user = req.query.id;
  if (!user) return res.json(config.msg.id);
  
  try {
    const result = await Func.axios.post("https://api.tokogame.com/core/v1/orders/validate-order", {
      "productId": "644359b1f61740160ca158ca",
      "questionnaireAnswers": [
        {
          "questionnaire": {
            "code": "userid",
            "inputType": "STRING",
            "translations": [
              {
                "language": "ID",
                "question": "Masukkan User ID",
                "description": "User ID",
                "choices": []
              }
            ]
          },
          "answer": user 
        } 
      ] 
    }, {
      headers: {
        "x-Language": "ID",
        "X-Currency": "IDR",
        "X-Request-Id": "08ad6a77-365f-458e-9a98-2e043c077ac7",
        "X-Secret-Id": "bb163e830b345d865a9b0c2c63545fb7f99df4b71a60ae426c01d586b3e06757"
      }
    });

    res.json(resSukses(result.data.data));
  } catch (e) {
    console.error(e);
    res.json(config.msg.error);
  }
});

router.get("/stalk/mobilelegends", checkApiKey, async (req, res) => {
  const user = req.query.id
  const zone = req.query.zone
  if (!user) return res.json(config.msg.id)
  if (!zone) return res.json(resValid("Masukan Parameter Zone ID."))
  
  try {
    const result = await scraper.stalk.mobileLegends(user, zone)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})

router.get("/stalk/genshin", checkApiKey, async (req, res) => {
  const id = req.query.id
  if (!id) return res.json(config.msg.id)
  
  try {
    const result = await Func.fetchJson("https://enka.network/api/uid/" + id)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
})



router.get("/search/tiktok", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.search.tiktok(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
}) 

router.get("/search/sfile", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.search.sfile(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
}) 

router.get("/search/apkmirror", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.search.apkmirror(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
}) 

router.get("/search/musixmatch", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.search.musixmatch(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
}) 

router.get("/search/chord", checkApiKey, async (req, res) => {
  const query = req.query.query
  if (!query) return res.json(config.msg.query)
  
  try {
    const result = await scraper.search.chord(query)
    res.json(resSukses(result))
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
  
}) 

router.get("/search/:action", async (req, res) => {
  const action = req.params.action;
  const query = req.query.query
  let response;

  try {
  switch(action) {
    case "":
      if (!query) return res.json(config.msg.query)
      break;
      default:
    }
  } catch (e) {
    console.error(e)
    res.json(config.msg.error)
  }
})

router.get("/tools/ssweb", checkApiKey, async (req, res) => {
	const { url, device } = req.query
	if (!url) return res.json(config.msg.url)
	if (!device) return res.json(resValid("Masukan paramater device."))
	
	try {
		const response = await scraper.tools.ssweb(url, device)
		res.type("png").send(response.data)
	} catch (e) {
      console.error(e)
      res.json(config.msg.error)
    }
})

module.exports = router