const mongoose = require('mongoose');
const user = require('./User');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
  },
  amount: Number,
  subtotal: Number,
  total: Number,
  payment_status: String,
  paymentDate: Date,
  created: {
    type: Number,
  },

});

module.exports = mongoose.model('Payment', paymentSchema);


