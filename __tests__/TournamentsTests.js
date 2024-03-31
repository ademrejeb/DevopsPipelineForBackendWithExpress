const express = require('express');
const TournamentRouter = require('../routes/Tournament');
const request = require('supertest');
const { expect } = require('chai');
const mongo = require("mongoose");
const config = require("../config/dbconfig.json");

// Connect to MongoDB
mongo.connect(config.url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => {
  console.log("Database connected");
  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
}).catch((err) => {
  console.error("Error with database connection:", err);
});

const app = express();
app.use('/Tournament', TournamentRouter);

async function resolveGetTournaments() {
  
  return await request(app)
      .get('/Tournament/getall')
      
}

describe('GET /Tournament/getall', () => {
  it('get all tournaments', async () => {
    const response = await resolveGetTournaments();
    console.log(response.statusCode);
    expect(response.statusCode).to.equal(200);
  }).timeout(30000);
});
