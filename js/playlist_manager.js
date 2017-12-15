var PlaylistManager = {
    playlists: [],

    populatePlaylists: () => {
        if (localStorage.playlists) {
            PlaylistManager.playlists = JSON.parse(localStorage.playlists);
        }
        $('.player').empty().append(View.playlists());
    },

    getPlaylist: (name) => {
        $('.view').hide();
        $('.search-results').empty().show();
        var view = ``;
        var desc = 'No description';
        ViewManager.searchResults = [];

        $.each(PlaylistManager.playlists, function(index, playlist) {
            if (playlist.name === name) {
                desc = playlist.description;
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
        ViewManager.changeView('playlist', '', '', name, desc);
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
        var name = $('#playlist-title').val();
        var description = $('#playlist-desc').val();
        var playlist = {
            name: name,
            description: description,
            songs: [],
        }

        if (PlaylistManager.validate(name, description)) {
            PlaylistManager.playlists.push(playlist);
            PlaylistManager.updatePlaylists();
            ViewManager.back();
            PlaylistManager.populatePlaylists();
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
