var PlaylistManager = {
    populatePlaylists: () => {
        if (localStorage.playlists) {
            playlists = JSON.parse(localStorage.playlists);
        }
        $("#playlist-browser").empty().append(`
            ${Player.header("Playlists")}
            <div class="nav-button action-button" id="create-playlist">
                <h2>Create Playlist</h2>
            </div>
        `);
        for (var i=0; i<playlists.length; i++) {
            $('#playlist-browser').append(
                ListItem.playlist(playlists[i][0], playlists[i][1])
            );
        }
    },

    showPlaylist: (playlist, description) => {
        $('.view').hide();
        $('.search-results').empty().show();
        var view = `
            ${Player.header(playlist)}
            ${Player.subheader(description)}
            ${Button.shuffle()}
        `;
        var results = [];

        for (var i=0; i< playlists.length; i++) {
            if (playlists[i][0] == playlist) {
                for (var j=2; j<playlists[i].length; j++) {
                    var metadata = playlists[i][j][0];
                    var artwork = `/SpotiFree/files/music/${metadata['artist']}/${metadata['album']}/Artwork.png`;

                    results.push(metadata);

                    view = view.concat(
                        ListItem.inPlaylist(
                            i, playlist, artwork,
                            metadata['name'],
                            metadata['artist'],
                            metadata['album'],
                            metadata['url'],
                            metadata['track']
                        )
                    );
                }
            }
        }

        $('#playlist-browser').empty().append(view).show();
        ViewManager.searchResults = results;
    },

    addToPlaylist: (playlistName, name, artist, album, url, artwork) => {
        if (localStorage.playlists) {
            playlists = JSON.parse(localStorage.playlists);
            for (var i=0; i< playlists.length; i++) {
                if (playlistName === playlists[i][0]) {
                    playlists[i].push(
                        [{name: name, artist: artist, album: album, track: 0, url:url}]
                    );
                }
            }
            localStorage.playlists = JSON.stringify(playlists);
        }
        PlaylistManager.hideSelector();
    },

    removeFromPlaylist: (playlist, url) => {
        alert(playlist);
        alert(url);
    },

    createPlaylist: () => {
        var name = $('#playlist-name').val();
        var description = $('#playlist-desc').val();
        var playlist = [name, description];

        if (PlaylistManager.validate(name, description)) {
            playlists.push(playlist);
            localStorage.playlists = JSON.stringify(playlists);
            PlaylistManager.populatePlaylists();
            $('#playlist-creator').hide();
            $('#playlist-browser').show();
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
