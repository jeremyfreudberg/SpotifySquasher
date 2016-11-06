# Spotify Squasher

Load in your Spotify playlists and squash them into one master playlist  

#### Get started  
1. Install dependencies:  
  ```
  $ npm install
  ```

2. Edit `constants.js.sample`:  

  ```
  module.exports = {
    clientID : "my_client_id",
    clientSecret : "my_client_secret",
    redirectURI : "http://mywebsite.com/app",
  }
  ```

3. Rename to `constants.js`:  
  ```
  $ mv constants.js.sample constants.js
  ```

4. Run the app (port 80 requires sudo privileges):
  ```
  $ sudo node app.js
  ```
