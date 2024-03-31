const express = require('express');
const router = express.Router();
const { getAllPayments ,getPaymentById,createPayment,updatePayment,deletePayment,sendMessage,getPaymentsByUserId,getPaymentByTournamentId} = require('../Controller/PaymentController');
//const { createStripePaymentSession, handleStripePaymentEvent } = require('../Controller/StripeController');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Payment = require('../models/Payment');
const tokenVerif = require("../middlewares/tokenVerification");
const stripe = require('stripe')('sk_test_51Orr3m2MKw3gvn4P2CV9rICMisl4jPIlQmlUqfXgls0HWLwNFa3ia10KP0VEgBH7lNBzx5QRX0obVbd3tfK9tS6f00vEmRLwkg');
const stripeWebhookSecret = 'whsec_ns52FHFVwqlgysR3i2omEhpRl8XPUtst';
const axios = require('axios');

// Routes pour les paiements
router.get('/', getAllPayments);
router.get('/:id',getPaymentById);
router.post('/createPayment', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);
router.post('/checkout-success', sendMessage);
router.get('/user/:userId', getPaymentsByUserId);
router.get('/byTournamentId/:tournamentId', getPaymentByTournamentId);
router.post("/create-checkout-session", async (req, res) => {
  try {
    const userId = req.body.userId;
    const tournamentId = req.body.tournamentId;

    const user = await User.findById(userId);
    const tournament = await Tournament.findById(tournamentId);

    const startDate = new Date(tournament.startYear, tournament.startMonth - 1, tournament.startDay);
    const endDate = new Date(tournament.endYear, tournament.endMonth - 1, tournament.endDay);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    let baseUnitAmount = 5000;
    if (tournament.tournamentType === 'Knockout') {
      baseUnitAmount = 3000;
    } else if (tournament.tournamentType === 'Championship') {
      baseUnitAmount = 4000;
    }

    let unitAmount = baseUnitAmount;
    if (durationDays > 4) {
      const additionalDays = durationDays - 4;
      unitAmount += additionalDays * 200;
    }

    const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const tndToUsdExchangeRate = exchangeRateResponse.data.rates.TND;
    const tndAmount = unitAmount * tndToUsdExchangeRate;

    const sessionLineItems = req.body.items.map(tour => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: tour.title,
            images: [tournament.logo] ,
            description: `Montant en TND: ${tndAmount /100}`,

          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: sessionLineItems,
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    });


    const Created = session.created;

    const payment = new Payment({
      user: userId,
      tournament: tournamentId,
      amount: unitAmount / 100,
      subtotal: unitAmount / 100,
      total: unitAmount / 100,
      payment_status: "unpaid",
      paymentDate: new Date(),
      created: session.created,
    });

    await payment.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;