var PlaylistManager = {
    playlists: [],

    populatePlaylists: () => {
        if (localStorage.playlists) {
            PlaylistManager.playlists = JSON.parse(localStorage.playlists);
        }
        $("#playlist-browser").empty().append(`
            ${Player.header("Playlists")}
            <div class="nav-button action-button" id="create-playlist">
                <h2>Create Playlist</h2>
            </div>
        `);
        $.each(PlaylistManager.playlists, function(index, playlist) {
            $('#playlist-browser').append(
                ListItem.playlist(playlist.name, playlist.description)
            );
        });
    },

    getPlaylist: (name, description) => {
        $('.view').hide();
        $('.search-results').empty().show();
        var view = `
            ${Player.header(name)}
            ${Player.subheader(description)}
            ${Button.shuffle()}
        `;
        ViewManager.searchResults = [];

        $.each(PlaylistManager.playlists, function(index, playlist) {
            if (playlist.name === name) {
                $.each(playlist.songs, function(key, song) {
                    var artwork = ApiManager.getArtwork(song.artist, song.album);
                    var clickEvent = `AudioManager.playSong('${song.name}', '${song.artist}', '${song.url}', true)`;

                    view = view.concat(
                        SearchResult.element(clickEvent, song.name, artwork, song)
                    );
                    ViewManager.searchResults.push(song);
                });
            }
        });
    },

    addToPlaylist: (playlistName, name, artist, album, url, artwork) => {
        PlaylistManager.getPlaylists();
        $.each(PlaylistManager.playlists, function(index, playlist) {
            if (playlist.name === playlistName) {
                var song = {
                    name: name,
                    artist: artist,
                    album: album,
                    track: 0,
                    url: url
                }
                PlaylistManager.playlists[index].songs.push(song)
            }
        });
        PlaylistManager.updatePlaylists();
        PlaylistManager.hideSelector();
        ViewManager.displayToast('files/images/playlist_add.png', `Added to ${playlistName}`);
    },

    getPlaylists: () => {
        if (localStorage.playlists) {
            PlaylistManager.playlists = JSON.parse(localStorage.playlists);
        }
        return PlaylistManager.playlists;
    },

    updatePlaylists: () => {
        localStorage.playlists = JSON.stringify(PlaylistManager.playlists);
    },

    removeFromPlaylist: (playlist, url) => {
        alert(playlist);
        alert(url);
    },

    createPlaylist: () => {
        var name = $('#playlist-name').val();
        var description = $('#playlist-desc').val();
        var playlist = {
            name: name,
            description: description,
            songs: [],
        }

        if (PlaylistManager.validate(name, description)) {
            PlaylistManager.playlists.push(playlist);
            PlaylistManager.updatePlaylists();
        } else {
            alert('Please fill out all the forms!');
        }
    },

    validate: (name, description) => {
        var isValid = true;
        if (name === '' || description === '')
            isValid = false;
        return isValid;
    },

    showSelector: (name, artist, album, url, artwork = null) => {
        $('.main').append(`${Player.playlistModal(name, artist, album, url, artwork)}`);
    },

    hideSelector: () => {
        $('.playlist-selector, .disabled').fadeOut("fast", function() {
            $(this).remove();
        })
    }
}
