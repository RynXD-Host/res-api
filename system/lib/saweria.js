const axios = require("axios")
const cheerio = require('cheerio')
const qrcode = require("qrcode")
const moment = require("moment-timezone") 

class Saweria {
   constructor(user_id) {
      this.user_id = user_id
      this.baseUrl = 'https://saweria.co'
      this.apiUrl = 'https://backend.saweria.co'
      this.bPending = '/donations/balance-imv'
      this.bAvailable = '/donations/available-balance'
   }

   login = (email, password) => {
      return new Promise(async resolve => {
         try {
            const json = await (await axios.post(this.apiUrl + '/auth/login', {
               email,
               password
            }, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": `${this.baseUrl}/`,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            }))
            if (!json.data.data || !json.data.data.id) return resolve({
               creator: "Arifzyn.",
               status: false,
               msg: e.message
            })
            resolve({
               creator: "Arifzyn.",
               status: true,
               data: {
                  user_id: json.data.data.id,
                  token: json.headers['authorization']
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: "Arifzyn.",
               status: false,
               msg: e.message
            })
         }
      })
   }

   createPayment = (amount, msg = 'Order') => {
      return new Promise(async resolve => {
         try {
            if (!this.user_id) return resolve({
               creator: "Arifzyn.",
               status: false,
               msg: 'USER ID NOT FOUND'
            })
            const json = await (await axios.post(this.apiUrl + '/donations/' + this.user_id, {
               agree: true,
               amount: Number(amount),
               customer_info: {
                  first_name: 'Payment Gateway',
                  email: 'arifzyn19@gmail.com',
                  phone: '',
               },
               message: msg,
               notUnderAge: true,
               payment_type: 'qris',
               vote: ''
            }, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": `${this.baseUrl}/`,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            })).data
            if (!json || !json.data || !json.data.id) return resolve({
               creator: "Arifzyn.",
               status: false,
               msg: 'ERROR!'
            })
            resolve({
               creator: "Arifzyn.",
               status: true,
               data: {
                  ...json.data,
                  expired_at: moment(json.data.created_at).add(10, 'minutes').format('DD/MM/YYYY HH:mm:ss'),
                  receipt: this.baseUrl + '/qris/' + json.data.id,
                  url: this.baseUrl + '/qris/' + json.data.id,
                  qr_image: await qrcode.toDataURL(json.data.qr_string, {
                     scale: 8
                  })
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: "Arifzyn.",
               status: false,
               msg: e.message
            })
         }
      })
   }

   checkPayment = id => {
      return new Promise(async resolve => {
         try {
            if (!this.user_id) return resolve({
               creator: "Arifzyn.",
               status: false,
               msg: 'USER ID NOT FOUND'
            })
            const html = await (await axios.get(this.baseUrl + '/receipt/' + id, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": this.baseUrl + '/receipt/' + id,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            })).data
            const $ = cheerio.load(html)
            const msg = $('h2[class="chakra-heading css-14dtuui"]').text()
            if (!msg) return resolve({
               creator: "Arifzyn.",
               status: false,
                 msg: 'TRANSAKSI TIDAK TERDAFTAR ATAU BELUM TERSELESAIKAN*\n\n*catatan:tolong check status transaksi kamu dengan mengetik check sekali lagi jika yakin telah menyelesaikan transaksi pembayaran'
            })
            const status = msg.toLowerCase() == 'berhasil' ? true : false
            resolve({
               creator: "Arifzyn.",
               status,
               msg: msg.toUpperCase()
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: "Arifzyn.",
               status: false,
               msg: e.message
            })
         }
      })
   }
   
   balance = (email, password) => {
      return new Promise(async resolve => {
         try {
            const login = await this.login(email, password)
            if (!login.status) return resolve(login)
            const pending = await (await axios.get(this.apiUrl + '/' + this.bPending, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": this.baseUrl + '/',
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "Authorization": login.data.token
               }
            })).data
            const available = await (await axios.get(this.apiUrl + '/' + this.bAvailable, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": this.baseUrl,
                  "Referer": this.baseUrl + '/',
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "Authorization": login.data.token
               }
            })).data
            resolve({
               creator: "Arifzyn.",
               status: true,
               data: {
                  pending: pending.data.balance || 0,
                  available: available.data['available-balance'] || 0
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: "Arifzyn.",
               status: false,
               msg: e.message
            })
         }
      })
   }
}

module.exports = { Saweria }
