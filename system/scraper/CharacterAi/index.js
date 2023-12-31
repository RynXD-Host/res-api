const Requester = require("./request");

const requester = new Requester();


const params = (text, hisoryId, characterId, tgt) => {
  const param = {
    history_external_id: hisoryId,
    character_external_id: characterId,
    text: text,
    tgt: tgt,
    ranking_method: "random",
    staging: false,
    model_server_address: null,
    model_server_address_exp_chars: null,
    override_prefix: null,
    rooms_prefix_method: "",
    override_rank: null,
    rank_candidates: null,
    filter_candidates: null,
    unsanitized_characters: null,
    prefix_limit: null,
    prefix_token_limit: null,
    stream_params: null,
    traffic_source: null,
    model_properties_version_keys: "",
    enable_tti: null,
    initial_timeout: null, 
    insert_beginning: null,
    stream_every_n_steps: 16,
    is_proactive: false,
    image_rel_path: "",
    image_description: "",
    image_description_type: "",
    image_origin_type: "",
    voice_enabled: false,
    parent_msg_uuid: null,
    seen_msg_uuids: [],
    retry_last_user_msg_uuid: null,
    num_candidates: 1,
    give_room_introductions: true,
    mock_response: false,
  };
  return param;
};

const CharAi = {
	id: "lRn6BD3_AlwtgfSDeM9MwVZgLTbk0-8YTaJXHR4m5uY",
	history: "U_9Bpm9ZRMZ-wT9ASsfRQLN7JqaDt61h8XHUDAJYItU",
	tgt: "internal_id:512192:a459e7f2-7367-4516-a895-f2e0683c7b95"
}

class Chat {
	constructor(characterId, continueBody) {
        this.characterId = characterId;
        this.externalId = continueBody.external_id;
        
        const ai = continueBody.participants.find(
            (participant) => participant.is_human === false
        );
        this.aiId = ai.user.username;
    }
    
	send = async (text) => {
    if (!this.characterId || !this.externalId || !this.aiId) reject(new Error("Invalid CharacterId, HistoryID, tgt"))
    
    const param = await params(text, this.externalId, this.characterId, this.aiId);
    const options = {
      method: "POST",
      headers: {
        Authorization: "Token 070f909d13b771a5c7a14ced188bcd3db341ff0f",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(param),
    };
    const response = await requester.request("https://beta.character.ai/chat/streaming/", {
      method: "POST",
      body: JSON.stringify(param),
      headers: {
        Authorization: "Token 070f909d13b771a5c7a14ced188bcd3db341ff0f",
        "Content-Type": "application/json",
      },
    });

    return JSON.parse(response.response);
  }
}

class CharacterAi {
	searchCharacter = (query) => {
    return new Promise(async (resolve, reject) => {
      if (query == undefined || typeof query != "string") throw Error("Invalid arguments.");
      
      await requester.initialize();
      await requester.page.setExtraHTTPHeaders({
        Authorization: "Token 070f909d13b771a5c7a14ced188bcd3db341ff0f",
        "Content-Type": "application/json",
      });

      const request = await requester.page.goto("https://beta.character.ai/chat/characters/search/?query=" +
          encodeURIComponent(query),
        { waitUntil: "domcontentloaded" },
      );

      if ((await request.status()) == 200) {
        resolve(await request.json());
      } else reject(new Error("Error response CharacterAi."));
      
      await requester.browser.close();
    });
  };
  
  createChat = async (characterId, externalId = null) => {
  	  await requester.initialize(); 
  	  const result = await requester.page.evaluate(async (characterId, externalId) => {
        const requestOptions = {
        	method: 'POST',
        	headers: {
        		Authorization: "Token 070f909d13b771a5c7a14ced188bcd3db341ff0f",
        		"Content-Type": "application/json",
            },
            body: JSON.stringify({
            	character_external_id: characterId,
            	history_external_id: externalId ? externalId : null
  	      })
        };
        
        let request = await fetch("https://beta.character.ai/chat/history/continue/", requestOptions);
        let response = await request.text(); 
    
   
        if (response === "No Such History" || response === "there is no history between user and character") {
        	request = await fetch('https://beta.character.ai/chat/history/create/', {
        		method: 'POST',
        		body: JSON.stringify({
        			character_external_id: characterId,
        			history_external_id: null
  	          }),
  	          headers: {
        			Authorization: "Token 070f909d13b771a5c7a14ced188bcd3db341ff0f",
        			"Content-Type": "application/json",
        		}
            })		
            response = await JSON.parse(request)
    	}
    	 
    	try {
    		response = JSON.parse(response);
    	} catch (error) {}
    	const continueBody = response;
    	return { characterId, externalId, continueBody }
    }, characterId, externalId)
    
    console.log(result)
    return new Chat(result.characterId, result.continueBody);
  }
  
  createChatId = async (characterId) => {
  	await requester.initialize(); 
  	const result = await requester.page.evaluate(async (characterId) => {
  		  const request = await fetch('https://beta.character.ai/chat/history/create/', {
        		method: 'POST',
        		body: JSON.stringify({
        			character_external_id: characterId,
        			history_external_id: null
  	          }),
  	          headers: {
        			Authorization: "Token 070f909d13b771a5c7a14ced188bcd3db341ff0f",
        			"Content-Type": "application/json",
        		}
            })		
            let response = await request.text();
            try {
            	response = JSON.parse(response);
            } catch (error) {}
            return response
  	}, characterId)
  	return result
  }
  
}

exports.CharacterAi = new CharacterAi()
	