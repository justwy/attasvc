var levelup = require('levelup')
var leveldown = require('leveldown')
 
class ScoresDB {
  constructor(path) {
    this.db = levelup(leveldown(path))
  }

  putScore(alias, score) {
      return new Promise((resolve, reject) => {
          this.db.put(alias, score, (err) => {
              if (err != null) {
                  return reject(err);
              }

              return resolve();
          })
      })
  }

  getScore(alias) {
      return new Promise((resolve, rej) => {
          this.db.get(alias, (err, result) => {
              if (err != null) return rej(err);

              return resolve(result);
          })
      })
  }
}

module.exports = ScoresDB;