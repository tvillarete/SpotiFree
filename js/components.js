var Player = {
    header: function(name) {
        return `
            <div class="header">
                ${name}
            </div>
        `;
    },

    subheader: function(name) {
        return `
            <div class="subheader">
                ${name}
            </div>
        `;
    },

    audio: (name, url) => {
        return `
            <audio class="audio" id="music" title="${name}" name="${name}" src="${url}"
             ontimeupdate="setInterval(updateTrackTime(this), 1000)">
            </audio>
        `;
    },

    playlistModal: (name, artist, album, url, artwork) => {
        PlaylistManager.getPlaylists();
        var view = `
            <div class="disabled"></div>
            <div class="playlist-selector">
                ${Player.header('Choose a playlist')}
        `;
        $.each(PlaylistManager.playlists, function(index, playlist) {
            console.log(playlist);
            view = view.concat(`
                ${ListItem.playlistSelection(playlist.name, name, artist, album, url, artwork)}
            `);
        })
        view = view.concat(`${Button.closePlaylistModal()}`)
        return view;
    }
}

var SearchResult = {
    element: (clickEvent, text, artwork, song) => {
        return `
            <div class="search-result">
                <div class="result-info" onclick="${clickEvent}">
                    ${artwork ? SearchResult.artwork(artwork) : ''}
                    ${text ? SearchResult.text(text) : ''}
                </div>
                <div class="result-options">
                    ${song ? SearchResult.options(song) : ''}
                </div>
            </div>
        `;
    },

    text: text => {
        return `
            <p>${text}</p>
        `;
    },

    artwork: url => {
        return `
            <img class="artwork" src="${url}">
        `;
    },

    options: song => {
        var artwork = ApiManager.getArtwork(song.artist, song.album);
        return `
            <div class="song-option-button add-to-queue" onclick="AudioManager.addToQueue(
                '${song.name}', '${song.artist}', '${song.album}', ${song.track}, '${song.url}'
            )">Queue</div>
            <div class="song-option-button add" onclick="PlaylistManager.showSelector(
                '${song.name}', '${song.artist}', '${song.album}', '${song.url}', '${artwork}'
            )">
                <img src="/SpotiFree/files/images/playlist_add.png">
            </div>
        `;
    }
}

var ListItem = {
    album: (name, artist) => {
        var imgSrc = ApiManager.getArtwork(artist, name);
        return `
            <div class="album-item" onclick="ViewManager.changeView('album', '${name}', '${artist}')">
                <img src="${imgSrc}">
                <p>${name}</p>
            </div>
        `;
    },

    playlist: function(name, description) {
        return `
            <div class="playlist playlist-item"
             onclick="PlaylistManager.showPlaylist('${name}', '${description}')">
                ${name}
            </div>
        `;
    },

    playlistSelection: function(playlist, name, artist, album, url, artwork) {
        return `
            <div class="playlist playlist-selector-item"
             onclick="PlaylistManager.addToPlaylist('${playlist}', '${name}',
              '${artist}', '${album}', '${url}', '${artwork}')">
                ${playlist}
            </div>
        `;
    },
};

var Button = {
    shuffle: (type=null, name=null) => {
        return `
            <div class="shuffle" value=${type} onclick="${type == 'playlist' ?
             'shufflePlaylist('+name+')' : ''}">
                <p>Shuffle Play</p>
            </div>
        `;
    },

    closePlaylistModal: () => {
        return `
            <div class="button action-button"
             onclick="PlaylistManager.hideSelector()">
                Cancel
            </div>
        `
    }
}

var AlbumView = {
    header: function(id, artwork, artist, album) {
        return `
            <div class="album-head">
                <div class="album-head-bg" style="background: url('${artwork}')">
                    <img src="${artwork}">
                </div>
                <div class="album-img" id="album-${id}">
                    <img class="artwork" src="${artwork}">
                    <div class="album-play" name="${album}" onclick="AudioManager.playAlbum('${album}')">
                        <img src="/SpotiFree/files/images/play_arrow.svg">
                    </div>
                </div>
                <div class="album-info">
                    <h3>${album}</h3>
                    <h6>${artist}</h6>
                    <div class="shuffle" onclick="AudioManager.playAlbum('${album}', true)">
                        <p>Shuffle Play</p>
                    </div>
                </div>
            </div>
        `;
    }
}

var View = {
    init: () => {
        $('.player').empty().append(View.main());
    },

    main: () => {
        return `
            <div class="view-container slide-in-left">
                <div class="view-section">
                    ${Player.header('Library')}
                    ${SearchResult.element("ViewManager.changeView('artists')", 'Artists')}
                    ${SearchResult.element("ViewManager.changeView('albums')", 'Albums')}
                    ${SearchResult.element("ViewManager.changeView('playlists')", 'Playlists')}
                </div>
            </div>
        `;
    },

    artists: () => {
        var view = ``;
        $.each(AudioManager.artists, function(index, artist) {
            var clickEvent = `ViewManager.changeView('${artist}')`;
            view = view.concat(
                SearchResult.element(clickEvent, artist)
            );
        });
        return View.navContainer(view, 'Artists', 'Library');
    },

    albums: () => {
        var view = ``;
        $.each(AudioManager.albums, function(index, data) {
            var clickEvent = `ApiManager.search(${data.album})`;
            view = view.concat(
                ListItem.album(data.name, data.artist)
            );
        });
        return View.navContainer(view, 'Albums', 'Library', 'album-container');
    },

    playlists: () => {
        var view = ``;
        $.each(PlaylistManager.playlists, function(index, playlist) {
            var clickEvent = `PlaylistManager.getPlaylist(${playlist.name, playlist.description})`;
            view = view.concat(
                SearchResult.element(clickEvent, playlist.name)
            );
        });
        return View.navContainer(view, 'Playlists', 'Library');
    },

    albumsByArtist(artist) {
        var view = ``;
        $.each(AudioManager.albums, function(index, data) {
            if (data.artist === artist) {
                view = view.concat(
                    ListItem.album(data.name, data.artist)
                );
            }
        });
        return View.navContainer(view, artist, 'Artists', 'album-container');
    },

    album: (album, artist) => {
        ApiManager.search(album);
        return View.navContainer('', '', artist, 'result-container');
    },

    navContainer: (contents, title, backText, id) => {
        var view = `
            <div class="nav-header">
                <div class="blur-bg"></div>
                <div class="back-button slide-in-left" onclick="ViewManager.back()">
                    &lsaquo; ${backText}
                </div>
                <div class="nav-header-title">
                    ${title}
                </div>
            </div>
            <div class="view-container slide-in-left">
                <div class="view-section" id="${id}">
                    ${contents}
                </div>
            </div>
        `;
        return view;
    }


}
