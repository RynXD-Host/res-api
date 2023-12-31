const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs")

const config = require("../../config.js")
const { Saweria } = require("../lib/saweria")
const { db } = require("../lib/database");
const Function = require("../lib/function")
const Func = new Function()

const saweria = new Saweria("f3405c17-9111-484a-87f7-63c430dc8055")

let tokens = "ArifzynAPI2023";
let database = loadDatabase();

function loadDatabase() {
  const filePath = path.join(__dirname, "../tmp/database.json");

  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveDatabase() {
  const filePath = path.join(__dirname, "../tmp/database.json");

  try {
    fs.writeFileSync(filePath, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error(error);
  }
}

function isAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Silahkan Masuk Untun Memulai Session.');
  res.redirect('/auth/login');
}

router.get("/", async (req, res) => {
	res.render("admin", {
		user: req.user,
		db: db,
		message: req.flash()
	})
})

// API PREMIUM 
router.post("/premium/add", async (req, res) => {
  const { username, days, token } = req.body;
  
  try {
    if (token !== tokens) {
  	req.flash("error", "Invalid Token Input")
  	res.redirect('/admin');
   } else {
    const user = await db.findOne({ username });

    if (!user) {
    	req.flash("error", "User Not Found")
        res.redirect('/admin');
    }
    
    user.premium = true; 
    user.premiumTime = new Date * 1 + days * 86400000 
    
    await user.save();

    req.flash("success", username + " Premium added successfully");
    res.redirect('/admin');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/listprem", async (req, res) => {
  try {
    const users = await db.find();
    let z = 1;
    const resultArray = [];

    users.filter(user => user.premium).forEach(user => {
      const timer = user.premiumTime ? user.premiumTime - new Date() : 0;

      resultArray.push({
        no: z++,
        name: user.username,
        premium: user.premium,
        expired: timer
      });
    });

    res.json(resultArray);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API USER 
router.post("/changeApikey", isAuthenticated, async (req, res) => {
	const { apikey } = req.body
	if (!apikey) return req.flash('error', 'Masukan Apikey.');
	const user = req.user
	const users = await db.findOne({ email: user.email })
	if (users.premium) {
		await db.updateOne({ email: user.email }, { apikey: apikey })
		req.flash('success', 'Apikey berhasil di ubah.');
		res.redirect('/profile');
	} else {
		req.flash('error', 'Kamu Bukan User Premium.');
		res.redirect('/profile');
	}
})

// API ORDER
router.get("/order", isAuthenticated, async (req, res) => {
	const package = req.query.package
	const user = req.user
	let data 
	switch (package) {
		case "basic":
		  data = await (await saweria.createPayment(5000)).data
		  const imageQR = await Func.upload(Buffer.from(data.qr_image.split(",")[1], "base64"))
		  data.qr_url = imageQR.url
		  data.limit = 500
		  data.duration = "30 Days"
		  data.premiumTime = new Date * 1 + 30 * 86400000 
		  res.render("order", {
			data, 
			user,
			package
		  })
		  database.push(data);
		  await saveDatabase();
		  break
		case "standard": 
		  
		  break 
		case "premium": 
		  
		  break
		case "enterprise": 
		  
		  break
		  default: 
	}
})

router.get("/order/check", isAuthenticated, async (req, res) => {
	const id = req.query.id 
	if (!id) return res.json(Func.resValid("Ivalid Parameter ID."))
	const users = database.find((item) => item.id === id)
	if (!users) return res.json(Func.resValid("ID Tidak Terdaftar Di List Order"))
	const check = await saweria.checkPayment(id)
	if (check.status) {
		res.json({
			creator: config.creator,
			status: check.status,
			message: "Transaksi anda sudah berhasil, Silahkan Cek Detail Profile Anda."
		})
		db.updateOne({ email: users.email }, {
			limit: users.limit, 
			premium: true,
			premiumTime: users.premiumTime,
		})
	} else {
		res.json({
			creator: config.creator,
			status: users.status,
			message: "Transaksi tidak terdaftar, Atau Belum Terselesaikan."
		})
	}
})

router.get("/cekApikey", async (req, res) => {
	const apikey = req.query.apikey
	if (!apikey) return res.json(Func.resValid("Masukan Parameter Apikey!"))
	
	try {
		const users = await db.findOne({ apikey: apikey })
		if (!users) return res.json(Func.resValid(`apikey \"${apikey}\" Tidak Terdaftar.`))
		const result = {
			usename: users.username,
			email: users.email,
			apikey: users.apikey,
			limit: users.limit,
			premium: users.premium
		}
		res.json(Func.resSukses(result))
	} catch (e) {
		console.error(e)
	}
})

module.exports = router;