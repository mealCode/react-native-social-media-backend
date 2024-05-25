import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.jkwgs5i.mongodb.net/tammira`;

mongoose
  .connect(dbURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Connection error', error));

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  name: String,
  profile_picture: String,
  email: String,
  location: {
    type: pointSchema,
    index: '2dsphere',
    required: true,
  },
  address: String,
  interests: [String],
  bio: String,
});

export const UserModel = mongoose.model('User', userSchema);
