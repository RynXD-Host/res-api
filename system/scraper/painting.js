const axios = require("axios")
const fs = require("fs")
const path = require("path")

const fileJSON = path.join(__dirname, "../tmp/data/painting.json")
const checkpoints = JSON.parse(fs.readFileSync(fileJSON))

const paintToken  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhbnlwYWludC5hcnQiLCJhdXRoIjoiMiIsImJ1c3NpbmVzcyI6IuS6kuiBlOe9kSIsImVtYWlsIjoiYXJpZnp5bjkwNkBnbWFpbC5jb20iLCJleHAiOjE3MDE2MDYyOTEsImlkZW50aXR5IjoiYXJpZnp5bjkwNkBnbWFpbC5jb20iLCJpZGVudGl0eV9mcm9tIjoiMyIsImlzcyI6ImFueXBhaW50Iiwib3JpZ19pYXQiOjE3MDE2MDI2OTEsInBob25lIjoiIiwidWlkIjoidXNlci1qeHhxOTVwNXYxNDM2cCJ9.MJgsup2jzE-ERko4kLA1A4UMFgZa7uqny2Oy9MkiRj4"
const login = {
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhbnlwYWludC5hcnQiLCJhdXRoIjoiMiIsImJ1c3NpbmVzcyI6IuS6kuiBlOe9kSIsImVtYWlsIjoiYXJpZnp5bjkwNkBnbWFpbC5jb20iLCJleHAiOjE3MDE2MTAwMDcsImlkZW50aXR5IjoiYXJpZnp5bjkwNkBnbWFpbC5jb20iLCJpZGVudGl0eV9mcm9tIjoiMyIsImlzcyI6ImFueXBhaW50Iiwib3JpZ19pYXQiOjE3MDE2MDY0MDcsInBob25lIjoiIiwidWlkIjoidXNlci1qeHhxOTVwNXYxNDM2cCJ9.eryCaxqcEJziwU59m-evX0UvmN5v-mUBWpgz3OApC5c",
    "expire": "2023-12-03 21:26:47",
    "refresh_token": "owyv90979nm409",
    "refresh_expire": "2023-12-06 20:26:47",
    "business": "互联网"
  },
  "msg": "ok"
}

module.exports = class Painting {
  constructor(token) {
    this.headers = {
      'authority': 'draw-plus-backend.anypaint.art',
      'content-type': 'application/json',
      Authorization: "Bearer " + token,
      'origin': 'https://anypaint.art',
      'referer': 'https://anypaint.art/',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  }

  Authorization = (token) => {
    return new Promise(async (resolve, reject) => {
      if (!token) reject(new Error("Enter Your Token!"))
      this.headers["Authorization"] = "Bearer " + token
      console.log(this.headers)
    })
  }

  upload = (fileBuffer) => {
    return new Promise(async (resolve, reject) => {
      let result;
      let post = await axios.post("https://draw-plus-backend.anypaint.art/v1/oss-files",
      {
        "filename": Date.now() + ".jpg",
        "file_size": fileBuffer.length
      }, { headers: this.headers })
      result = post.data
      console.log(result)
      let PUT = await axios.put(result.data.url, fileBuffer,
      {
        headers: {
          "Content-type": "image/jpeg",
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
        }
      })
      console.log(PUT)
      resolve(result)
    })
  }

  request = (pathUrl, prompt = "", model = 8) => {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios.post("https://draw-plus-backend.anypaint.art/v1/speeds/convert",
      {
        "base_model_path": checkpoints[model - 1].file_path,
        "model_hash": checkpoints[model - 1].hash,
        "model_name": checkpoints[model - 1].id,
        "image": pathUrl,
        "action": "line",
        "prompt": prompt,
        "mode": "1",
        "full_canny": false,
        "part_canny": false
      },
      {
        headers: this.headers
      })
      resolve(data)
    })
  }

  generate = (buffer, prompt, model) => {
    return new Promise(async (resolve, reject) => {
      const upload = await this.upload(buffer)
      const request = await this.request(upload.data.oss_key, prompt, model)

      while (true) {
        try {
          response = await axios.get("https://draw-plus-backend.anypaint.art/v1/img-tasks/" + request.data.task_id, { headers: this.headers });
          if (response.data.data.progress == 100) {
            resolve({ status: true, url: response.data.data.hig_images[0] })
            break;
          } else if (response.data.progress < 0) {
            resolve({ status: false })
            break;
          }
        } catch (e) {
          break
          reject(new Error(error.message))
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    })
  }
};

let headers = {      
 headers: {
        Authorization: "Bearer " + login.data.token,
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
 }
}


const upload = async(fileBuffer) =>{// ○ Create by @rifza.p.p
  return new Promise(async(resolve, reject) => {
  let result;
    let post = await axios.post("https://draw-plus-backend.anypaint.art/v1/oss-files",    
      {
      "filename": "images (14).jpeg",
       "file_size": fileBuffer.length
      },      
      { ...headers }
    )
    result = post.data
    console.log(result)
    let PUT = await axios.put(result.data.url, fileBuffer,
    {
      headers: { 
        "Content-type": "image/jpeg",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"        
      }
    })
    console.log(PUT)
    resolve(result)
  })
}

const painting = async(pathUrl, prompt="", model=8) =>{// ○ Create by @rifza.p.p
  return new Promise(async(resolve, reject) => {
    let { data } = await axios.post("https://draw-plus-backend.anypaint.art/v1/speeds/convert",
    {
    "base_model_path": checkpoints[model-1].file_path,
    "model_hash": checkpoints[model-1].hash,
    "model_name": checkpoints[model-1].id,
    "image": pathUrl,
    "action": "line",
    "prompt": prompt,
    "mode": "1",
    "full_canny": false,
    "part_canny": false
    },
    {
    ...headers
    }
    )
    resolve(data)
  })
}

 
module.exports = painter = async(buffer, prompt, model)=>{// ○ Create by @rifza.p.p
 return new Promise(async(resolve, reject) => {// ○ Create by @rifza.p.p
  let up = await upload(buffer)
  console.log(up)
  let paint = await painting(up.data.oss_key, prompt, model)
  console.log(paint)
  while (true) {
        try {
          response = await axios.get("https://draw-plus-backend.anypaint.art/v1/img-tasks/" +paint.data.task_id, { ...headers });
          console.log(response.data.data.progress)
            if (response.data.data.progress == 100) {
              resolve({ status: true, url: response.data.data.hig_images})
            break;
            } else if(response.data.progress < 0){
              resolve({ status: false })
            break;
            }
        } catch (error) {
          break
          reject(error.message)
        }

       await new Promise(resolve => setTimeout(resolve, 2000));
    }
 }) 
}  