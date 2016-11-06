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
     spotify.listPlaylists(accessTokenGlobal, function(e, r){
       var playlists_list = r['playlists_list'];
       res.render('app.html', { pl : playlists_list });
     });
});

app.post('/squash', function(req, res){
  res.send(req.body);
});

app.get('/logout', function(req, res){
  accessTokenGlobal = null;
  req.logout();
  res.redirect('/');
});

app.listen(80);
