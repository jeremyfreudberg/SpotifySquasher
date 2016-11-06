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

  },

  getTracks :
  function getTracks(at, pURIs, callback){

    var trackURIs = [];
    var trackURIsChunk;
    var tracks;
    async.each(pURIs,
      function(pURI, done) {
        request.get({
                      url : pURI,
                      headers : {'Authorization': 'Bearer ' + at },
                      json : true
                    }, function(err, res, body) {
                         trackURIsChunk = [];
                         tracks = body['items'];
                         tracks.forEach(function(track) {
                           trackURIsChunk.push(track['track']['uri']);
                         });
                       trackURIs.push.apply(trackURIs, trackURIsChunk);
                       done(null);
                    });
      },
      function(err, results) {
        callback(null, { tracks : trackURIs });
      }
    );

  },

  createPlaylist :
  function createPlaylist(at, id, name, callback){

    request.post({
                   url : 'https://api.spotify.com/v1/users/'+id+'/playlists',
                   headers : { 'Authorization' : 'Bearer ' + at },
                   json : { name : name }
                 }, function(err, res, body) {
                      callback(null, {
                                       url : body['tracks']['href'],
                                       web : body['external_urls']['spotify']
                                     });
                 });
  },

  addTracks :
  function addTracks(at, pu, chunks, callback){

    async.each(chunks,
      function(chunk, done) {
        request.post({
                      url : pu,
                      headers : { 'Authorization' : 'Bearer ' + at },
                      json : { uris : chunk }
                     }, function(err, res, body) {
                          done(null);
                     });
      },
      function(err, results) {
        callback(null);
      }
    );

  }

}
