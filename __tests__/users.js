const express = require('express');
const userRoutes = require('../routes/User');
const request = require('supertest');
const { expect } = require('chai');
const jwt = require("jsonwebtoken");
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
app.use('/User', userRoutes);

async function resolveGetUsers() {
  const accessToken = jwt.sign(
      {
        "user": {
          email: "moatazfoudhaily@gmail.com",
          roles: [30]
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1m' }
  );
  return await request(app)
      .get('/User/getall')
      .set('authorization', `Bearer ${accessToken}`);
}

describe('GET /User/getall', () => {
  it('get all users', async () => {
    const response = await resolveGetUsers();
    console.log(response.statusCode);
    expect(response.statusCode).to.equal(200);
  }).timeout(30000);
});
