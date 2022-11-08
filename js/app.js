// login
// get current album cover
//    if none display spotify logo
//   when album changes update
//    how often to test?
//   background last 50 albums played
//  when mouse moves
//    display artist album track names
//    display spotify icon for profile top right
//      profile contains info and logout button?

// this app uses https://github.com/massivelines/login-node-for-spotify to login to spotify
// TODO check scopes
// TODO test when spotify is off
var scopes = ['user-read-email', 'user-read-currently-playing', 'user-read-playback-state', 'user-read-recently-played', 'user-top-read', 'user-read-private']; //scopes for permissions
var nodeHost = 'https://login-node-for-spotify.herokuapp.com'; //location of node server

// controls how long the login element fades in milliseconds
loginFade = 1000;

var spotify = new SpotifyHeroku(scopes, nodeHost, loginFade); //passes vars to new class

document.getElementById('login').addEventListener('click', function() {
  // TODO setup node to fade instead of none
  spotify.login();
}, false);

document.getElementById('logout').addEventListener('click', function() {
  spotify.logout();
}, false);

// hides the loggedin-profile div until the user has loged in
var userProfile = document.getElementById('profile');
userProfile.setAttribute('style', 'display: none;');

// called from app.js after logged in
function main() {
  var commercial = false;
  var access_token;

  // shows user profile after logging in
  userProfile.setAttribute('style', 'display: inherit;');

  function accessToken() {
    access_token = localStorage.getItem('access_token');
  }
  accessToken();


  profile();

  function profile() {

    $.ajax({
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response) {
        var user = {
          name: response.display_name,
          email: response.email,
          profileImg: response.images["0"].url,
          product: response.product
        };
        $('#profileImg').html('<img src="' + user.profileImg + '">');
        $('#user').html('<h1>Logged in as ' + user.name + '</h1>');
        $('#email').text('Email: ' + user.email);
        $('#product').text('Account Type: ' + user.product);
      },
      error: function(response) {
        console.log('profile');
        console.log(response);
      }
    });
  } // end of profile --------------------------------------------------


  // TODO if playing, get device, and same info
  // https://api.spotify.com/v1/me/player
  // else so dialog to start playback
  // also pass device to profile page


  //holder to check if art needs to change
  var holdAlbumImg = null;

  function getCurrentAlbum() {
    var refresh;

    function refreshCurrentAlbum() {
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/',
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {

          // if a commercial is on
          if (response.item == null) {
            commercial = true;
            $('#cover_background').css('opacity', 0);
            $('#track').html('');
            $('#artist').html('');
            $('#album').html('');
            // else get album art
          } else {
            // fade in to cover from commercial and toggle track-details visiblity
            if ($('#cover_background').css('opacity') == 0) {
              $('#cover_background').css('opacity', 1);
              commercial = false;
            }
            var playing = {
              artist: response.item.album.artists["0"].name,
              album: response.item.album.name,
              track: response.item.name,
              albumImg: response.item.album.images["0"].url,
              artistURL: response.item.artists["0"].external_urls.spotify,
              albumURL: response.item.album.external_urls.spotify,
              trackURL: response.item.external_urls.spotify
            };

            // if changing to new cover
            if (holdAlbumImg != playing.albumImg) {

              // if there was a previous cover
              if (holdAlbumImg) {
                $('#previousCover').css("background-image", "url('" + holdAlbumImg + "')");
              }

              $('#cover').css("background-image", "url('" + playing.albumImg + "')");
              $('#track').html('<a href=' + playing.trackURL + ' target="_blank">' + playing.track + '</a>');
              $('#artist').html('<a href=' + playing.artistURL + ' target="_blank">' + playing.artist + '</a>');
              $('#album').html('<a href=' + playing.albumURL + ' target="_blank">' + playing.album + '</a>');
              holdAlbumImg = playing.albumImg;
            }
          }
          refresh = setTimeout(refreshCurrentAlbum, 250);
        },
        error: function(response) {
          if (response.status == 401) {
            console.log('refreshCurrentAlbum == 401');
            console.log(response);
            spotify.refresh();
            console.log('refresh token');
            accessToken();
            refreshCurrentAlbum();
          } else {
            console.log('refreshCurrentAlbum');
            console.log(response);
          }
        }
      });
    }


    refreshCurrentAlbum();
  } // end of get getCurrentAlbum ------------------------------------------

  // get user's top albums
  // save id's in array
  // lookup id's and get album art
  // create grid or bricks, maybe random sizes


} // end of main -------------------------------------------------

$(document).foundation();
