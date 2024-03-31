const stripe = require('stripe')('sk_test_51OpIvqHJCyMdA57TO4gItUpDj6TpTKWJb3zDD4UuYGGibgdrAKdpxuJiKonH21vOeiVXRM38koZtjJgF2bLm0v9900Rdaad7x8');

// Importez votre modèle Payment
const Payment = require('../models/Payment');



exports.createStripePaymentSession = async (req, res) => {
    try {

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000, // The amount in cents (e.g., $10.00)
            currency: 'usd',
            description: 'Payment for your product or service',
            payment_method_types: ['card'],
            receipt_email: 'customer@example.com', // Email to send receipt to
            metadata: {
                order_id: '12345', // Any custom metadata you want to attach
            },
            shipping: {
                name: 'John Doe',
                address: {
                    line1: '123 Main St',
                    city: 'City',
                    state: 'CA',
                    postal_code: '12345',
                    country: 'US',
                },
            },
            // Other payment intent details...
        });

        const clientSecret = paymentIntent.client_secret;

// Use the clientSecret in your frontend code to confirm the payment
        res.json(clientSecret)

        // res.json({ sessionId: session.id }); // Renvoie l'ID de la session de paiement à utiliser dans le frontend pour rediriger l'utilisateur vers la page de paiement Stripe
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fonction pour gérer les événements de paiement Stripe
exports.handleStripePaymentEvent = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, 'sk_test_51Orr3m2MKw3gvn4P2CV9rICMisl4jPIlQmlUqfXgls0HWLwNFa3ia10KP0VEgBH7lNBzx5QRX0obVbd3tfK9tS6f00vEmRLwkg');
    } catch (err) {
        return res.status(400).send(err);
    }

    // Gérez l'événement de paiement Stripe ici
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // Handle checkout session completed event
            break;
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Handle payment intent succeeded event
            break;
        // Add more cases for other types of events as needed
        default:
            console.log("Add other cases to handle different types of Stripe events as needed");
    }

    res.status(200).json({ received: true });
};