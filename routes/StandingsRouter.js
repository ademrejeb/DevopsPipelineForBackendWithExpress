const express=require("express")
const router=express.Router()
const Standingscontroller = require("../Controller/StandingsController")



router.get("/CreateStandings/:id" , Standingscontroller.createInitialStandings);

router.get("/GetByTournament/:id" , Standingscontroller.getStandingsByTournamentId);

router.get("/GetbyID/:id", Standingscontroller.getStandingsById)

router.put("/upadteStandings/:id/:matchId" , Standingscontroller.updateStanding); 

module.exports = router;