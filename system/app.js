const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const logger = require("morgan")

const fs = require("fs")
const chalk = require("chalk");
const figlet = require("figlet");
const chokidar = require('chokidar');
const path = require("path");
const cron = require("node-cron");

const {
  connectToMongoDb,
  db
} = require("./lib/database")
const config = require("../config")
const api = require("./router/api");
const main = require("./router/main");
const admin = require("./router/admin");
const auth = require("./router/auth");

const app = express();
const port = process.env.PORT || config.options.port

const resetLimit = async () => {
  const users = await db.find({})
  users.forEach(async (data) => {
    const { username } = data
    if (!username == null) {
      return db.updateOne({
        username: username
      }, {
        limit: 25
      }, function(err, res) {
        if (err) throw err
      })
    }
  })
}

const updateExpiredPremium = async (user) => {
  if (user.premium && user.premiumTime <= Date.now()) {
    user.premium = false;
    user.premiumTime = 0;
    await user.save();
    console.log(`Premium expired for user: ${user.username}`);
  }
};

const expiredPremiumUsers = async () => {
  try {
    const users = await db.find({ premium: true });

    for (const user of users) {
      await updateExpiredPremium(user);
    }
  } catch (error) {
    console.error(`Error updating expired premium users: ${error}`);
  }
};

 
app.enable('trust proxy');
app.set("json spaces", 2);
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.json({
  limit: '5mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '5mb'
}));
app.use(bodyParser.text({ type: "text/html" }));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 86400000
  },
  store: MongoStore.create({
    mongoUrl: config.mongoURL
  }),
}));
app.use(passport.initialize());
app.use(passport.session());
require('./lib/config')(passport);
app.use(flash());

app.use("/", api)
app.use("/", main)
app.use("/admin", admin)
app.use("/", auth)

app.use(function (req, res, next) {
  res.status(404).json({
    status: 404,
    creator: config.options.creator,
    message: "Page Not Found - 404"
  })
})

connectToMongoDb()
setInterval(expiredPremiumUsers, 60000);

cron.schedule('0 12 * * *', async () => {
  try {
    const updateResult = await db.updateMany(
      { premium: false }, 
      { $set: { limit: 25 } }
    );
    await config.message('</> Reset limit success √', "HTML");
    console.log(`Reset limits for ${updateResult.nModified} non-premium users.`);
  } catch (error) {
    console.error('Error resetting limits:', error);
  }
}, {
  timezone: 'Asia/Jakarta',
});

app.listen(port, () => {
  console.log(chalk.white(figlet.textSync(`[ Arifzyn APi ]`, {
    horizontalLayout: 'full'
  })));
  console.log(chalk.green(`\nStart Server...`));
  console.log(chalk`{cyanBright  Author:} {bold.rgb(255,69,0) Arifzyn.}`);
  console.log(chalk`{yellowBright  Github:} {underline https://github.com/ArifzynXD}`);
  console.log(chalk`{blueBright  YouTube:} {underline https://youtube.com/@arifzxa19}`);
  console.log(chalk.blue(` Server Running on ${chalk.bold(`http://localhost:${port}`)}`));
});

module.exports = app