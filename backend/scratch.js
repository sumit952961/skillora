import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Model = mongoose.model('Test', Schema);

const doc = new Model({ userId: new mongoose.Types.ObjectId() });
console.log(JSON.stringify(doc.toObject()));
