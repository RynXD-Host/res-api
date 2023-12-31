const config = require("../../config")
const mongoose = require("mongoose")

exports.connectToMongoDb = () => {
  try {
    mongoose.connect(config.mongoURL)
    const mongo = mongoose.connection;
    mongo.on('error', console.error.bind(console, 'Connection error:'));
    mongo.once('open', () => {
      console.log('</> Success connect to MongoDb ');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

const data = mongoose.Schema({
  googleId: { type: String },
  username: { type: String },
  email: { type: String },
  apikey: { type: String },
  limit: { type: Number },
  profile: { type: String },
  isAdmin: { type: Boolean },
  premium: { type: Boolean },
  premiumTime: { type: Number },
});

exports.db = mongoose.model('user', data);