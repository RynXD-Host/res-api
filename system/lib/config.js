const { db } = require("./database")

const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const config = require("../../config")

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: config.api.google.clientId,
    clientSecret: config.api.google.clientSecret,
    callbackURL: config.api.google.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
    	const users = await db.findOne({ email: profile.emails[0].value }) 
    	if (users) {
    		return done(null, users)
    	} else {
    		const keys = await randomText(12)
    		const obj = {
    			googleId: profile.id,
    			username: profile.displayName,
    			email: profile.emails[0].value,
    			limit: config.options.limit || 25,
    			profile: profile.photos[0].value,
    			apikey: "AR-" + keys,
    			isAdmin: false,
    			premium: false,
    			premiumTime: 0
    		}
    		
    		await db.create(obj)
    		const text = `<b>New User Register:</b>\n\n`
    		  + `Name: ${obj.username}\n`
    		  + `Email: ${obj.email}\n`
    		  + `Limit: ${obj.limit}\n`
    		  + `Premium: ${obj.premium}\n`
    		  + `Apikey: <code>${obj.apikey}</code>\n\n`
    		  + `Source : <a href=\'https://api.arifzyn.biz.id\'>Arifzyn API</a>`
    		await config.message(text, "HTML")
    		return done(null, obj);
    	} 
    } catch (err) {
    	return done(err, false);
    }
  }));
  
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(async function(obj, done) {
    try {
      const user = await db.findById(obj._id);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });
}

function randomText (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let txt = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    txt += characters.charAt(randomIndex);
  }

  return txt;
};
