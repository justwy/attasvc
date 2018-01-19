const challonge = require('challonge');
var lodash = require('lodash');

class ChallongeService {
    constructor(apiKey, subdomain) {
        this.apiKey = apiKey;
        this.subdomain = subdomain;
        this.client = challonge.createClient({
            apiKey: apiKey,
            subdomain: subdomain
        });
    }

    getMatches(tournamentId) {
        return new Promise((resolve, reject) => {
            this.client.matches.index({
                id: tournamentId,
                callback: (err, data) => {
                    if (err != null) {
                        return reject(err);
                    }

                    var gameResult = lodash.chain(data)
                        .filter((value, key) => {
                            //  only final stage counts
                            return value.match.groupId == null 
                            && value.match.winnerId != null
                            && value.match.loserId != null;
                        })
                        .map((value, key) => {
                            var winnerId = value.match.winnerId;
                            var loserId = value.match.loserId;
                            return {
                                winner: value.match.winnerId,
                                loser: value.match.loserId,
                                sequence: key
                            }
                        })
                        .value();

                    // lodash.map order is not guarenteed. So need to sort by key
                    gameResult = lodash.sortBy(gameResult, 'sequence');

                    return resolve(gameResult)
                }
            });
        })
    }

    getParticipate(tournamentId, participateId) {
        return new Promise((resolve, reject) => {
            this.client.participants.index({
                id: tournamentId,
                callback: (err, data) => {
                    if (err) return reject(err);

                    return resolve(data);
                }
            });
        });
    }

    getATTATournaments() {
        return new Promise((resolve, reject) => {
            this.client.tournaments.index({
                callback: (err, data) => {
                    if (err) return reject(err);
                    return resolve(lodash.map(data, (value, key) => value.tournament));
                }
            });
        });
    }
}

module.exports = ChallongeService;