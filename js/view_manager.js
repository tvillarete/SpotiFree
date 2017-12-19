var ViewManager = {
    searchResults: [],
    viewStack: [],
    recentlyPlayed: (localStorage.recentlyPlayed ? JSON.parse(localStorage.recentlyPlayed) : []),

    back: () => {
        var view = ViewManager.viewStack.pop();
        $('.player').empty().append(view);
        if (ViewManager.viewStack.length == 0) {
            ViewManager.updateRecentlyPlayed();
        }
    },

    getId: (artist, name) => {
        artist = artist.replace(/\s+/g, '-').toLowerCase();
        name = name.replace(/\s+/g, '-').toLowerCase();
        return `${artist}-${name}`;
    },

    updatePlayerState: () => {
        var song = AudioManager.getSongAtIndex();
        if (song) {
            var artwork = ApiManager.getArtwork(song.artist, song.album);
            var id = ViewManager.getId(song.artist, song.name);

            $('.blur').css('background', `url('${artwork}') no-repeat`);
            $('.blur').css('background-size', `cover`);
            $('#artwork-fullscreen, .artwork-container').html(`<img src="${artwork}">`);

            $('.song-title').text(song.name);
            $('.song-album').html(`${song.artist} &mdash; ${song.album}`);

            $('.search-result').removeClass('playing');
            $('.controls').show();
            $('.player').addClass('show-controls');
            if (AudioManager.isPlaying) {
                $('.controls').addClass('playing');
            } else {
                $('.controls').removeClass('playing');
            }
        }
    },

    showFullscreenControls: () => {
        $('.controls').toggleClass('fullscreen');
    },

    displayToast: (icon, text) => {
        var toast = `
            <div class="toast">
                <img src="${icon}">
                <h3>${text}</h3>
            </div>
        `;
        $('body').append(toast);
        setTimeout(function() {
            $('.toast').fadeOut("fast", function() {
                $('.toast').remove();
            });
        }, 1000);
    },

    changeView: (id, option, artist, playlist, desc) => {
        var view;

        switch(id) {
            case 'artists':
                view = View.artists();
                break;
            case 'albums':
                view = View.albums();
                break;
            case 'album':
                view = View.album(option, artist);
                break;
            case 'playlists':
                view = View.playlists();
                break;
            case 'playlist-creator':
                view = View.playlistCreator();
                break;
            case 'playlist':
                view = View.playlist(playlist, desc);
                break;
            case 'search':
                view = View.search(option);
                break;
            case 'empty':
                view = View.emptyView(option);
                break;
            default:
                view = View.albumsByArtist(id);
                break;
        }
        $('.nav-header').removeClass('reveal-nav');
        ViewManager.viewStack.push($('.player').children());
        $('.view-container, .back-button, .nav-header-title').removeClass('slide-in-left');
        $('.view-container, .back-button').addClass('slide-in-right');
        $('.player').empty().append(view);
    },

    populateResults: () => {
        var currentAlbum = '';
        var view = '';
        var currentSong = AudioManager.getSongAtIndex();

        $.each(ViewManager.searchResults, function(index, song) {
            if (currentAlbum !== song.album) {
                var artwork = ApiManager.getArtwork(song.artist, song.album);

                view = view.concat(AlbumView.header(index, artwork, song.artist, song.album));
                currentAlbum = song.album;
            }
            var clickEvent = `AudioManager.playSong('${song.name}', '${song.artist}', '${song.url}', true)`;
            var options = {
                clickEvent: clickEvent,
                classes: 'dark-result',
                text: song.name,
                song: song,
                id: ViewManager.getId(song.artist, song.name),
                isPlaying: (currentSong && song.url == currentSong.url) ? true : false,
            }
            view = view.concat(
                SearchResult.element(options)
            );
        });
        $('.view-container div').append(view);
    },

    addToRecentlyPlayed: song => {
        var newArray = [];
        $.each(ViewManager.recentlyPlayed, function(index, value) {
            if (song.url !== value.url) {
                newArray.push(value);
            }
        });
        newArray.unshift(song);
        if (newArray.length > 6) {
            newArray.pop();
        }
        ViewManager.recentlyPlayed = newArray;
        localStorage.recentlyPlayed = JSON.stringify(ViewManager.recentlyPlayed);
    },

    updateRecentlyPlayed: () => {
        $('#recently-played-container').empty().append(View.recentlyPlayed());
    },

    performSearch: (query) => {
        ViewManager.changeView('empty', query);
        ApiManager.search(query);
    },

    toggleControlsDisabled: (value) => {
        if (value === 'off') {
            $('.controls-disabled').fadeOut('fast');
            Controls.toggleFullscreen('off');
            PopupDialog.remove();
        } else if (value === 'on') {
            $('.controls-disabled').fadeIn('fast');
        } else {
            $('.controls-disabled').fadeToggle('fast');
        }
    },

    togglePopupDisabled: value => {
        if (value === 'off') {
            $('.popup-disabled').fadeOut('fast');
            Controls.toggleFullscreen('off');
            PopupDialog.remove();
        } else if (value === 'on') {
            $('.popup-disabled').fadeIn('fast');
        } else {
            $('.popup-disabled').fadeToggle('fast');
        }
    },
}
