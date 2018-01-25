var util = require('util');
var express = require('express');
var router = express.Router();

var cron = require('node-cron');
// refresh every day at mid night
//cron.schedule('0 0 * * *', async function(){
cron.schedule('*/10 * * * * *', async function(){
    refreshRanking();
});

const DEFAULT_API_KEY = process.env.TOKEN;
const DEFAULT_SUB_DOMAIN = 'atta';
const K_FACTOR = 64;
const INITIAL_SCORE = 400;

const RANKING_ELIGIBLE_TAG = 'ranking eligible';

var HashMap = require('hashmap');
var scoreByAlias = new HashMap();
var ranking = [];

var ChallongeService = require('../challonge')
var challongeService = new ChallongeService(DEFAULT_API_KEY, DEFAULT_SUB_DOMAIN);

var ScoreAlgo = require('../scoreAlgo');
var scoreAlgo = new ScoreAlgo(K_FACTOR);

var lodash = require('lodash');

/* GET home page. */
router.get('/', async function (req, res, next) {
    res.send(JSON.stringify(ranking));
});

async function refreshRanking() {
    var tournaments = await challongeService.getATTATournaments();
    tournaments = tournaments
        .filter(tournament => tournament.description.toLowerCase().includes(RANKING_ELIGIBLE_TAG))
        .filter(tournament => tournament.completedAt != null)
        .map(t => t.url);


    // rank tournaments by "startedAt" time
    tournaments = lodash.sortBy(tournaments, 'completedAt');

    console.log('will analyze tournaments in serie: ', tournaments);

    // and then iterate the following calculation for each tournament
    // Wrong: await Promise.all(tournaments.map(tournamentId => updateRanking(scoreByAlias, tournamentId)));
    // we want to run tournaments in serie, not in parallel.
    scoreByAlias.clear() // empty the scores for everyone because we will recalculate.
    for (var tournamentId of tournaments) {
        await updateRanking(scoreByAlias, tournamentId)
    }
        
    // empty the array before update
    ranking = [];

    scoreByAlias.forEach(function (value, key) {
        ranking.push({
            alias: key,
            score: value
        });
    });

    ranking = lodash.sortBy(ranking, ['score', 'alias']).reverse();
    console.log('current ranking \n', ranking);
}

async function updateRanking(scoreByAlias, tournamentId) {

    var participantById = new HashMap();

    try {
        var participates = await challongeService.getParticipate(tournamentId);

        lodash.forEach(participates, (value, key) => {
            participantById.set(value.participant.id, value.participant);
        });

    } catch (e) {
        console.error(e);
        return
    }

    var matches = await challongeService.getMatches(tournamentId);

    matches.forEach(match => {
        var newScores = null;

        var winnerAlias = participantById.get(match.winner).name;
        var loserAlias = participantById.get(match.loser).name;

        var winnerScore = getScore(scoreByAlias, winnerAlias);
        var loserScore = getScore(scoreByAlias, loserAlias);

        try {
            var newScores = scoreAlgo.getScore([winnerScore, loserScore]);
        } catch (e) {
            console.error(e);
            return;
        }

        setScore(scoreByAlias, winnerAlias, newScores[0]);
        setScore(scoreByAlias, loserAlias, newScores[1]);

        console.log('evaluating match: ', match, ' ', winnerAlias, ' won ', loserAlias);
    });
}

function getScore(scoreByAlias, alias) {
    var score = scoreByAlias.get(alias);
    if (score == null) {
        score = INITIAL_SCORE;
        scoreByAlias.set(alias, score);
    }

    return score;
}

function setScore(scoreByAlias, alias, score) {
    scoreByAlias.set(alias, score);
}

//refresh on startup
refreshRanking();

module.exports = router;
