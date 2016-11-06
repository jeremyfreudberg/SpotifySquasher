const request = require('request');
const async = require('async');

module.exports = {

  listPlaylists :
  function listPlaylists(at, callback){

    var offset = 0;
    var hasNext;
    var spotifyResults = [];
    async.doWhilst(
      function(done) {
        request.get({
                  url : 'https://api.spotify.com/v1/me/playlists',
                  qs : { limit : 50, offset : offset },
                  headers : {'Authorization': 'Bearer ' + at },
                  json : true
                }, function(err, res, body) {
                     hasNext = body['next'];
                     offset += 50;
                     spotifyResults.push(body['items']);
                     done(null);
                });
      },
      function() {
        return hasNext != null;
      },
      function(err, results) {
        callback(null, { playlists_list : spotifyResults });
      }
   );

  }

}
