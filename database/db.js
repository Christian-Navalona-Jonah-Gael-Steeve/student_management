const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri, {});
    console.log('Connexion à la base mongo OK');
  } catch (err) {
    console.error('Erreur de connexion MongoDB:', err);
  }
};

module.exports = {
    connectDB
};
