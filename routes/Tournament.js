const express=require("express")
const router=express.Router()
const TournamentControlle=require('../Controller/TournamentControlle')
const tokenVerif = require('../middlewares/tokenVerification')
const upload = require('../config/multer_tournament')


router.post('/add',tokenVerif.requireAuth,upload.single("logo"),TournamentControlle.add);

router.get('/getall',TournamentControlle.getall);

router.get('/getbyid/:id',TournamentControlle.getbyid);

router.get('/getbyname/:name',TournamentControlle.getbyname);

router.put('/update/:id',TournamentControlle.update);

router.delete('/delete/:id',TournamentControlle.deleteTournament);

router.get('/generateRoundRobinSchedule/:id',TournamentControlle.generateRoundRobinSchedule);

router.put('/addTeams/:id', TournamentControlle.addTeams);

router.post("/generateMatchs/:id", TournamentControlle.generateLeagueMatchFixtures);

router.get("/fixtures/:id",TournamentControlle.getFixtures);

router.get("/fixturesByDay/:id/:day",TournamentControlle.getfixturesbyDay);

router.get("/DoubleLegLeagueMatchGeneration/:id", TournamentControlle.generateDoubleLegSchedule)

router.get("/UserTournaments",tokenVerif.requireAuth , TournamentControlle.getTournamentsByUserId)

router.put("/StartTournament/:id", TournamentControlle.startTournament);

router.get("/KnockoutTournamentBuild/:id" , TournamentControlle.KnockoutTournamentBuild);

router.get("/KnockoutTournament/:id" , TournamentControlle.getTournamentRoundsById);
 
router.get("/ChampionshipGroupsAndMatches/:id" , TournamentControlle.createChampionshipGroupsAndMatches);

router.put("/addRate/:id" , TournamentControlle.addRateToTournament);

router.put("/follow/:id" , tokenVerif.requireAuth,TournamentControlle.FollowTournament);

router.put("/unfollow/:id" , tokenVerif.requireAuth,TournamentControlle.UnfollowTournament);

router.put("/UpdateTournamentKnockout/:id/:matchId" ,TournamentControlle.KnockoutUpdateTournamentRounds) ;

router.put("/generateKnockoutChampionshipMatches/:id" , TournamentControlle.generateKnockoutChampionshipMatches)

router.put("/UpdateGroupStandingAfterMatch/:id" , TournamentControlle.UpdateGroupStandingAfterMatch );

router.put("/addRefereesAndStadiumsToTournament/:id", TournamentControlle.addRefereesAndStadiumsToTournament)

router.get("/getRefereesAndStadiumsForTournament/:id" , TournamentControlle.getRefereesAndStadiumsForTournament);

router.get("/getFixturesKnockout/:id"  ,TournamentControlle.getFixturesKnockout);

router.get("/getMatchesFromGroupsWithMatches/:id" ,TournamentControlle.getMatchesFromGroupsWithMatches);

router.get("/GetGroupsAndStandings/:id" , TournamentControlle.GetGroupsAndStandings);

router.get("/FixturesByDayKnockout/:id/:day",  TournamentControlle.FixturesByDayKnockout) ;

router.get("/MatcheGroupsByday/:id/:day", TournamentControlle.getMatchesFromGroupsWithMatchesByday);


module.exports = router;



