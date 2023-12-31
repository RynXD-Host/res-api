const fs = require("fs")
const axios = require("axios");
const marked = require("marked");
const fetch = require("node-fetch")
const ranName = (ext) => {
	return `${Math.floor(Math.random() * 10000000000)}.jpg`
}

/*
async function upload(name, buffer) {
    console.log("🖼️ Starting image processing");
    let size = buffer.byteLength;

    try {
        console.log("💻 Finding Google server destination");
        const startResponse = await axios.post("https://push.clients6.google.com/upload/", {
            headers: {
                "X-Goog-Upload-Command": "start",
                "X-Goog-Upload-Protocol": "resumable",
                "X-Goog-Upload-Header-Content-Length": size,
                "X-Tenant-Id": "bard-storage",
                "Push-Id": "feeds/mcudyrk2a4khkz",
            },
            withCredentials: true,
        });

        const uploadUrl = startResponse.headers['x-goog-upload-url'];
        console.log("📤 Sending your image");
        const uploadResponse = await axios.post(uploadUrl, buffer, {
            headers: {
                "X-Goog-Upload-Command": "upload, finalize",
                "X-Goog-Upload-Offset": 0,
                "X-Tenant-Id": "bard-storage",
            },
            withCredentials: true,
        });

        const imageFileLocation = uploadResponse.data;
        console.log("✅ Image finished working\n");
        return imageFileLocation;
    } catch (e) {
        throw new Error(
            "Could not fetch Google Bard. You may be disconnected from the internet: " + e.message
        );
    }
}
*/

exports.bardimg = async(prompt, buffer) => {
  return new Promise(async (resolve, reject) => {
    console.log("🖼️ Starting image processing");
    let size = buffer.byteLength;
    let name = ranName()
      console.log("💻 Finding Google server destination");
      const startResponse = await axios.post("https://push.clients6.google.com/upload/", null, {
        headers: {
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Header-Content-Length": size,
          "X-Tenant-Id": "bard-storage",
          "Push-Id": "feeds/mcudyrk2a4khkz",
        },
        data: 'File name: '+name,
        withCredentials: true,
      });

      const uploadUrl = startResponse.headers['x-goog-upload-url'];
      console.log("📤 Sending your image");
      const uploadResponse = await axios.post(uploadUrl, buffer, {
        headers: {
          "X-Goog-Upload-Command": "upload, finalize",
          "X-Goog-Upload-Offset": 0,
          "X-Tenant-Id": "bard-storage",
        },
        withCredentials: true,
      });

      const imageFileLocation = uploadResponse.data;
      console.log("✅ Image processing finished");
      console.log(imageFileLocation);

      const config = {
        method: "POST",
        url: "https://bard.google.com/u/4/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20231120.10_p0&f.sid=-7340305029166932526&hl=id&_reqid=1835835&rt=c",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "Cookie": "cookie nya taro sini"
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
        },///contrib_service/ttl_1d/1699444808ju4mcycyydanna2d35q5fijhirsrs6_AZkpjSH6RejgQs7dNHsu-XkgbPuJiEW1s4DpDQQanfHSuK4iL59IY9MMcbgX
        data: `f.req=%5Bnull%2C%22%5B%5B%5C%22${prompt}%5C%22%2C0%2Cnull%2C%5B%5B%5B%5C%22${imageFileLocation}️%5C%22%2C1%5D%2C%5C%22${name}%5C%22%5D%5D%2Cnull%2Cnull%2C0%5D%2C%5B%5C%22id%5C%22%5D%2C%5B%5C%22%5C%22%2C%5C%22%5C%22%2C%5C%22%5C%22%2Cnull%2Cnull%2C%5B%5D%5D%2C%5C%22!cHOlcyvNAAb0h-UC1IdCT_9A88O8sNA7ADQBEArZ1LFov64ri5SMcDgArvK7bfOv5_biNLS99ILwVrIWnz3TEBda_uN4yaJfC-ozKMgfAgAABSBSAAACBmgBB5kDOIWw7zm-M8ScNuBRWC3rMXuXXj9BdLYCrp9MUAmYsh1Ew8GKuAMkc1UbffMCxm37KCrCfPA7WLCRZ6NPZUtVBRCLnvg02YNUIcuGQXA1aivvIPkefHpLCICJsVRlsfqA5zWy7-6d_9-5KVrDgpTRZu1hAAsOWBD2605hbImYWcQJxqSlBrlOwH0f9rhy_eAhdJM0fIWVoWHwMNk3Nx34bI_AOlykE40qZmXGJi3Zzo0K-XLOcK2leVA_RLSaQcI6rb0izwlMtSOcFF22D6ZrYspjqsZ7p-vBJfoV7xn-78zpgTQVvjj8dzp5ThFyWSUx6KLruuEktUG8uwaOLjKuUI8O5aAGtsYrpSJiEqUSJ3x2hVICat2t6FSzUYdrAdWfraZaXraUY3-cegx1SdANkNV2igPowfLYm9Do2mldEu6mie3PxztN5up_X1Zi9aPb4qL1ZV2iYqg1a_3NQAAIhfiUZdcGPYdb5CvE-OaDbpItBmQJX4bDXyR8T5XwcWJL7G97n_CvByIRkvn8IqF3PU-f2TtwHy21kFC_wXKWrBUGN7n0YLnN5ZGZ-RHicTfvNFIHcJh1KvIsSeqwsEYUNPyGmjNelQo87lPZY6HpeJD-p9IIc62WcLLlf3nJKzTYbOi8SM1CyLha6_Nehwpprvb9WYtcY7gEgRtnmhLTz7B33tH3db2kDYhoiskM13KZj_XIEaz5eO9j1FLl7ZwNiqlt-VreJc5pXNXImN5nWfrH5B4Ci34DwOpX66j4wDBnz9HqoaFld5lg9cYgdG19hs5F_2F3X4YfhXpJIL-Mnv8n5k625Cn1PrDL9lvgM0KRBBdZB1l-6fYOCoB2tldbAHwn0BHZPXp5lA-yZD-8p2178h4_Uj9PpIh98V9bbUn83UP4WDE0CCcUHoguCRMV8__RihTfu9vAFBQLUrlePTeAPfDozojBQEiKHfUdag6QgfXf10rMTNsJZ6tJk2k10VZiEMP2ksYn52SukZ_I3VayyXEVjy7URhGYeLOj6qL6BuNYI7RcOL8NaHOQef0q9TYkexr6mK82jmQHNefyiTPLrZzAQRhfGL0x9ewkdDafBtsvnPb04k9b%5C%22%2C%5C%2269882e84a6db57043c7368bc779d18a7%5C%22%2Cnull%2C%5B1%5D%2C0%2C%5B%5D%2C%5B%5D%2C1%2C0%5D%22%5D&at=AOTFbH4lxoK3nOecpWOlopSYnpBV%3A1701053829687&`
     };

  let formatMarkdown = (text, images) => {      
  if (!images) return text;
  for (let imageData of images) {
    const formattedTag = `![${imageData.tag}](${imageData.url})`;
    text = text.replace(new RegExp("(?<!\\!)" + imageData.tag.replace("[", "\\[").replace("]", "\\]")), formattedTag);
  }
  return text;
};      
  try {
    const response = await axios(config);
    const data = JSON.stringify(response.data);
    const myaa = data.split("wrb.fr");
    const rawData = myaa[1].split("null");
    const raw2 = rawData[3];
    const lenSize = raw2.length;
    const newData = raw2.slice(36, lenSize - 9);
    const finalHTMLdata = marked.parse(newData).replace(/\\n/g, " ").replace(/\\/g, "\n").replace(/&quot;./g, "").replace(/#39;/g, "").replace(/#39;/g, "").replace(/\nr/g, '');
    const convertedFinalData = convertHtmlEntities(finalHTMLdata);
    resolve(convertedFinalData);
  } catch (error) {
    reject('Eror lapor owner');
  }
 })  
};