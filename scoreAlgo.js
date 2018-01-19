class EloRank {
    constructor(k) {
        this.k = k || 32;
    }

    setKFactor(k) {
        this.k = k;
    }
    getKFactor() {
        return this.k;
    }

    getExpected(a, b) {
        return 1 / (1 + Math.pow(10, ((b - a) / 400)));
    }
    updateRating(expected, actual, current) {
        return Math.round(current + this.k * (actual - expected));
    }

    /**
     * updated scores from a game. 
     * @param {* arrays containing two scores - 0: winnerScore, 1: losserScore. } scores 
     * @return {* arrays containing two scores - 0: winnerScore, 1: losserScore. } updated scores.
     */
    getScore(scores) {
        //Gets expected score for first parameter
        var expectedScoreA = this.getExpected(scores[0], scores[1]);
        var expectedScoreB = this.getExpected(scores[1], scores[0]);

        var newScores = [];

        //update score, 1 if won 0 if lost
        newScores.push(this.updateRating(expectedScoreA, 1, scores[0]));
        newScores.push(this.updateRating(expectedScoreB, 0, scores[1]));

        return newScores;
    }
}


module.exports = EloRank;