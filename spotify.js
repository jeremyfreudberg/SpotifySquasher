const request = require('request');

module.exports = {

  listPlaylists :
  function listPlaylists(at, callback){

    var options = {
      url : 'https://api.spotify.com/v1/me/playlists',
      headers: { 'Authorization': 'Bearer ' + at },
      json: true
    };

    request.get(options, function(error, response, body) {
      callback(null, {body : body});
    });
  
  }

}
