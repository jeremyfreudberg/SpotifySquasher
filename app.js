const express = require('express'),
      passport = require('passport'),
      nunjucks = require('nunjucks'),
      bodyParser = require('body-parser');
 
const SpotifyStrategy =
      require('passport-spotify').Strategy;

const constants = require('./constants');
const spotify = require('./spotify');

const clientID = constants.clientID;
const clientSecret = constants.clientSecret;
const redirectURI = constants.redirectURI;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var accessTokenGlobal;
var userIDGlobal;

passport.use(new SpotifyStrategy({
  clientID: clientID,
  clientSecret: clientSecret,
  callbackURL: redirectURI
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      accessTokenGlobal = accessToken;
      return done(null, profile);
    });
  }));

const app = express();

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

app.get('/', function(req, res){
  res.render('index.html');
});

app.get('/auth/spotify',
  passport.authenticate('spotify',
    {scope: ['playlist-read-private', 'playlist-read-collaborative',
             'playlist-modify-public', 'playlist-modify-private'], 
     showDialog: true}
  ),
  function(req, res){
  // nothing goes here because redirect
});

app.get('/app',
   passport.authenticate('spotify', {failureRedirect: '/auth/spotify' }),
   function(req, res){
     userIDGlobal = req.user['id'];
     spotify.listPlaylists(accessTokenGlobal, function(e, r){
       var playlists_list = r['playlists_list'];
       res.render('app.html', { pl : playlists_list });
     });
});

app.post('/squash', function(req, res){
  var toSquash = req.body;
  var pURIs = Object.keys(toSquash).map(function(key){return toSquash[key]});
  spotify.getTracks(accessTokenGlobal, pURIs, function(e,r){
    var allTracks = r['tracks'];
    var bad = 'spotify:local';
    var tracks = allTracks.filter(function(s){ return s.indexOf(bad) < 0; });
    app.locals.tracks = tracks;
    res.render('squash.html', { numTracks : tracks.length });
  });
});

app.get('/createPlaylist', function(req, res){
  var pn = req.query['playlistName'];
  spotify.createPlaylist(accessTokenGlobal, userIDGlobal, pn, function(e,r){
    var newPlaylistURL = r['url'];
    app.locals.newPlaylistURL = newPlaylistURL;
    res.redirect('/done');
  });
});

app.get('/done', function(req, res){
  var chunks = [], tracks = app.locals.tracks;
  while (tracks.length > 0){ chunks.push(tracks.splice(0, 100)); }
  var pu = app.locals.newPlaylistURL;
  spotify.addTracks(accessTokenGlobal, pu, chunks, function(e,r){
    res.render('success.html');
  });
});

app.get('/logout', function(req, res){
  accessTokenGlobal = null;
  req.logout();
  res.redirect('/');
});

app.listen(80);
