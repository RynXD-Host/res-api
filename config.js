const axios = require('axios');
 
const options = {
  creator: "Arifzyn.",
  port: 3000,
  limit: 25,
  
  token: "6488020821:AAEtbVJvAxHPJPDInjkWvlUUdXSd8766fd0",
  chatId: "6176867516",
} 

module.exports = {
  options,
 
  api: {
    prodia: "7b736a45-069e-483c-8e7f-098067fb32b2",
    openai: "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", 
    gemini: "AIzaSyDYEhk9stqfq1cvzdjBRiK1-Axxkb79y54",
    google: {
    	clientId: "574520314477-37uoebkj1b3labqiitns1uts8atmvir6.apps.googleusercontent.com",
    	clientSecret: "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",
    	callbackURL: "https://api.arifzyn.biz.id/auth/google/callback"
    }, 
    bing: []
  },
  
  smtp: {
  	email: "arifzynapis19@gmail.com",
  	pass: "phyyygodbtmezwvu"
  },
  
  mongoURL: "mongodb+srv://arifzyn906:Arifzyn19@arifzynapi.1vwsizt.mongodb.net/?retryWrites=true&w=majority",
  message: async (text, mode) => {
  	try {
  		const { data } = await axios.post(`https://api.telegram.org/bot${options.token}/sendMessage`, {
  			chat_id: options.chatId,
  			text: text,
  			parse_mode: mode
          })
          
          console.log(data.ok)
      } catch (e) {
      	console.error(e)
      }
  },
  
  web: {
    title: "Arifzyn API", 
    footer: "Copyright © 2023 Arifzyn.",
    tags: {
      "anime": "fas fa-ghost", 	
      "download": "fas fa-download",
      "ai": "fas fa-robot",
      "stalker": "fas fa-eye",
    },
  },
  
  msg: {
    query: {
      status: 403,
      creator: options.creator,
      message: "Masukan Parameter Query."
    },
    text: {
      status: 403,
      creator: options.creator,
      message: "Masukan Parameter Text."
    },
    param: {
      status: 403,
      creator: options.creator,
      message: "Parameter Invalid, silahkan cek lagi."
    },
    url: {
      status: 403,
      creator: options.creator,
      message: "Masukan Parameter URL."
    },
    user: {
      status: 403,
      creator: options.creator,
      message: "Masukan Parameter User Name."
    },
    id: {
      status: 403,
      creator: options.creator,
      message: "Masukan Parameter ID."
    },
    error: {
      status: 403,
      creator: options.creator,
      message: "Terjadi Kesalahan Saat Mengambil data."
    }
  }
}