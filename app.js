const express = require("express");
const http = require("http");
const cors = require('cors');
const Bodyparser = require('body-parser');
const mongo = require("mongoose");
const app = express();
const passport = require("passport");
const googleAuth = require("./routes/index");
const session = require("express-session");
const ResultRouter=require("./routes/ResultRoute");
const Result = require('./models/Result')
const config = require('./config/dbconfig.json');
const cookieParser = require('cookie-parser') ;
const stripe = require("stripe")("sk_test_51Orr3m2MKw3gvn4P2CV9rICMisl4jPIlQmlUqfXgls0HWLwNFa3ia10KP0VEgBH7lNBzx5QRX0obVbd3tfK9tS6f00vEmRLwkg");
const stripeWebhookSecret = "whsec_DkhMYus3KybNiTsCJ5SlJO3a39ZN0ShO";
const chatController = require('./Controller/ChatController')
// Middleware
app.use(Bodyparser.json({ limit: '50mb' }));
app.use(cors());
app.use(cookieParser());
require("dotenv").config();

//session
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
    })
);

//morgan
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
require("./auth/google-auth")(passport);

app.use("/", googleAuth);

// Routes
const userRouter = require("./routes/User");
app.use("/User", userRouter);
app.use('/uploads', express.static('uploads'));
const TournamentRouter = require("./routes/Tournament");
app.use("/Tournament", TournamentRouter);

const StandingsRouter = require("./routes/StandingsRouter");
app.use("/Standings", StandingsRouter);

const StadiumRouter = require("./routes/Stadium");
app.use("/Stadium", StadiumRouter);

const TeamRouter = require("./routes/Team");
app.use("/Team", TeamRouter);

app.use(cors());
const PaymentRouter = require("./routes/Payment");
app.use("/Payment", PaymentRouter);

const NotificationRouter = require("./routes/Notification");
app.use("/Notification", NotificationRouter);

const ChatRouter = require("./routes/Chat");
app.use("/chat", ChatRouter);

// complaint Routes
const ComplaintRouter = require("./routes/Complaint");
const Payment = require("./models/Payment");
app.use("/api", ComplaintRouter);


app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const Created = session.created;

        try {
            const payment = await Payment.findOne({ created: Created });

            if (payment) {
                payment.payment_status = 'paid';
                await payment.save();

                console.log(`Payment with payment_intent ${Created} updated to paid.`);
            } else {
                console.error(`Payment with payment_intent ${Created} not found.`);
                const allPayments = await Payment.find();
                console.log('All Payments:', allPayments);
            }
        } catch (error) {
            console.error('Error finding/updating payment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    res.json({ received: true });
});


const MatchRouter = require("./routes/Match");
app.use("/Match", MatchRouter);

// Server setup
app.use("/api",ResultRouter);
const server=http.createServer(app);
const io=require("socket.io")(server);
chatSocket=io;
// Generate network avatars
app.use('/uploads/avatar', express.static('uploads/avatar'));

// Generate network avatars
app.use('/uploads/avatar', express.static('uploads/avatar'));

app.use('/uploads/team', express.static('uploads/team'));

// Database connection
server.listen(3000,console.log("server is running"))
  mongo.connect(config.url ,{
      useUnifiedTopology:true,
      useNewUrlParser:true,
  }).then (()=> console.log("database connected")).catch(()=>console.log("error with db connection "));



//WebSockets:
io.on("connection", (socket) => {
    console.log('Client connected');


  socket.on('goal', async ({ team,matchID }) => {
    try {
      // Update match data in the database based on the team that scored
      console.log(matchID)
      const result = await Result.findOne( {match: matchID}).populate('match');

      if (!result) {
        throw new Error('Match not found');
      }

      if (team === 'team1') { 
        console.log("team1 goal")
        result.team1Goals++;
        //result.team1Goals.push({ time }); // Store the time of the goal

      } else if (team === 'team2') {
        console.log("team2 goal")

        result.team2Goals++;
        //result.team2Goals.push({ time }); // Store the time of the goal

      }
            await result.save();

            // Emit scoreUpdate event to all connected clients with updated score information
            io.emit('scoreUpdate', { team1Goals: result.team1Goals, team2Goals: result.team2Goals });
        } catch (error) {
            console.error('Error:', error.message);
        }
    });
  socket.on('red', async ({ team,matchID }) => {
    try {
      // Update match data in the database based on the team that scored
      const result = await Result.findOne({match: matchID}).populate('match');
      if (!result) {
        throw new Error('Match not found');
      }

      if (team === 'team1') {
        console.log("team1 red")
        result.team1Red++;
      } else if (team === 'team2') {
        console.log("team2 red")

        result.team2Red++;
      }

      await result.save();

      // Emit scoreUpdate event to all connected clients with updated score information
      io.emit('redUpdate', { team1Red: result.team1Red, team2Red: result.team2Red });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  );
  socket.on('yellow', async ({ team,matchID }) => {
    try {
      // Update match data in the database based on the team that scored
      const result = await Result.findOne({match: matchID}).populate('match');
      if (!result) {
        throw new Error('Match not found');
      }

      if (team === 'team1') {
        console.log("team1 yellow")
        result.team1Yellow++;
      } else if (team === 'team2') {
        console.log("team2 yellow")

        result.team2Yellow++;
      }

      await result.save();

      // Emit scoreUpdate event to all connected clients with updated score information
      io.emit('yellowUpdate', { team1Yellow: result.team1Yellow, team2Yellow: result.team2Yellow });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  );
  socket.on('corners', async ({ team,matchID }) => {
    try {
      // Update match data in the database based on the team that scored
      const result = await Result.findOne({match: matchID}).populate('match');
      if (!result) {
        throw new Error('Match not found');
      }

      if (team === 'team1') {
        console.log("team1 corner")
        result.team1Corners++;
      } else if (team === 'team2') {
        console.log("team2 corner")

        result.team2Corners++;
      }

      await result.save();

      // Emit scoreUpdate event to all connected clients with updated score information
      io.emit('cornersUpdate', { team1Corners: result.team1Corners, team2Corners: result.team2Corners });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  );
  socket.on('offsides', async ({ team,matchID }) => {
    try {
      // Update match data in the database based on the team that scored
      const result = await Result.findOne({match: matchID}).populate('match');
      if (!result) {
        throw new Error('Match not found');
      }

      if (team === 'team1') {
        console.log("team1 offside")
        result.team1Offsides++;
      } else if (team === 'team2') {
        console.log("team2 offside")

        result.team2Offsides++;
      }

      await result.save();

      // Emit scoreUpdate event to all connected clients with updated score information
      io.emit('offsidesUpdate', { team1Offsides: result.team1Offsides, team2Offsides: result.team2Offsides });
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  );
    socket.on('message',async (data)=>{
        await chatController.sendMessage(io,data);
    })
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


module.exports = app;
