var View = {
    init: () => {
        $('.player').empty().append(View.main());
        ThemeManager.setCurrentTheme();
    },

    main: () => {
        return `
            <div class="view-container slide-in-left">
                <div class="theme-changer" onclick="ThemeManager.toggleTheme()">
                    Theme
                </div>
                <div class="view-section">
                    ${Player.header('Library')}
                    ${Player.searchbar()}
                    ${SearchResult.element("", "ViewManager.changeView('artists')", 'Artists')}
                    ${SearchResult.element("", "ViewManager.changeView('albums')", 'Albums')}
                    ${SearchResult.element("", "ViewManager.changeView('playlists')", 'Playlists')}
                </div>
                <div class="view-section">
                    ${Player.subheader('Recently Played')}
                </div>
                <div class="view-section">
                    ${View.recentlyPlayed()}
                </div>
            </div>
        `;
    },

    recentlyPlayed: () => {
        var view = `
            <div id="recently-played-container">
        `;
        ViewManager.searchResults = ViewManager.recentlyPlayed;
        $.each(ViewManager.recentlyPlayed, function(index, song) {
            var artwork = ApiManager.getArtwork(song.artist, song.album);
            var clickEvent = `AudioManager.playSong('${song.name}','${song.artist}', '${song.url}', true)`;
            var options = {
                clickEvent: clickEvent,
                text: song.name,
                artwork: artwork,
                song: song,
                id: ViewManager.getId(song.artist, song.name)
            }
            view = view.concat(
                SearchResult.element(options)
            );
        });
        return view.concat(`</div>`);
    },

    artists: () => {
        var view = ``;
        $.each(AudioManager.artists, function(index, artist) {
            var options = {
                classes: 'dark-result',
                clickEvent: `ViewManager.changeView('${artist}')`,
                text: artist,
            }
            view = view.concat(
                SearchResult.element(options)
            );
        });
        return View.navContainer(view, 'Artists', 'Library');
    },

    albums: () => {
        var view = ``;
        $.each(AudioManager.albums, function(index, data) {
            var clickEvent = `ApiManager.search(${data.album})`;
            view = view.concat(
                Button.album(data.name, data.artist)
            );
        });
        return View.navContainer(view, 'Albums', 'Library', 'album-container');
    },

    playlists: () => {
        var buttonOptions = {
            text: 'New Playlist',
            clickEvent: `ViewManager.changeView('playlist-creator')`,
        }
        var view = ``;
        PlaylistManager.getPlaylists();
        $.each(PlaylistManager.playlists, function(index, playlist) {
            var options = {
                clickEvent: `PlaylistManager.getPlaylist('${playlist.name}')`,
                text: playlist.name,
            }
            view = view.concat(
                SearchResult.element(options)
            );
        });
        view = view.concat(Button.actionButton(buttonOptions));
        return View.navContainer(view, 'Playlists', 'Library', 'playlist-browser');
    },

    playlistCreator: () => {
        var options = {
            text: 'Create',
            clickEvent: `PlaylistManager.createPlaylist()`,
        }
        var view = `
            <div class="view-section" id="playlist-creator">
                <form id="playlist-creator-form">
                    <input type="text" id="playlist-title" placeholder="Title">
                    <input type="text" id="playlist-desc" placeholder="Description">
                </form>
                ${Button.actionButton(options)}
            </div>
        `;
        return View.navContainer(view, 'Create Playlist', 'Playlists');
    },

    playlist: (name, desc) => {
        var view = `<h3>${desc}</h3>`;
        $.each(PlaylistManager.playlists, function(index, playlist) {
            if (playlist.name === name) {
                $.each(playlist.songs, function(key, song) {
                    var artwork = ApiManager.getArtwork(song.artist, song.album);
                    var clickEvent = `AudioManager.playSong('${song.name}','${song.artist}', '${song.url}', true)`;
                    var options = {
                        clickEvent: clickEvent,
                        text: song.name,
                        artwork: artwork,
                        song: song,
                        id: ViewManager.getId(song.artist, song.name)
                    }
                    view = view.concat(
                        SearchResult.element(options)
                    );
                });
            }
        });
        return View.navContainer(view, name, 'Playlists');
    },

    albumsByArtist(artist) {
        var view = ``;
        $.each(AudioManager.albums, function(index, data) {
            if (data.artist === artist) {
                view = view.concat(
                    Button.album(data.name, data.artist)
                );
            }
        });
        return View.navContainer(view, artist, 'Artists', 'album-container');
    },

    album: (album, artist) => {
        ApiManager.search(album);
        return View.navContainer('', '', artist, 'result-container');
    },

    search: form => {
        var text = $(form).find('.searchbar').val();
        ApiManager.search(text);
        return View.navContainer('', '', 'Library', 'result-container');
    },

    emptyView: (title) => {
        return View.navContainer('', title, 'Back', 'result-container');
    },

    navContainer: (contents, title, backText, id) => {
        animation = !ViewManager.viewStack.length ? 'reveal-nav' : '';
        var view = `
            <div class="nav-header ${animation}">
                <div class="blur-bg"></div>
                <div class="back-button slide-in-left" onclick="ViewManager.back()">
                    &lsaquo; ${backText}
                </div>
                <div class="nav-header-title">
                    ${title}
                </div>
            </div>
            <div class="view-container slide-in-left shifted-down">
                <div class="view-section" id="${id}">
                    ${contents}
                </div>
            </div>
        `;
        return view;
    }


}
