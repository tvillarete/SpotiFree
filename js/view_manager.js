var ViewManager = {
    searchResults: [],
    viewStack: [],

    back: () => {
        var view = ViewManager.viewStack.pop();
        $('.player').empty().append(view);
    },

    updatePlayerState: () => {
        var song = AudioManager.getSongAtIndex();
        var artwork = ApiManager.getArtwork(song.artist, song.album);
        $('.cover-bg').css('background', `url('${artwork}') no-repeat`);
        $('.cover-bg').css('background-size', `cover`);
        $('.playback-artwork').replaceWith(`
            <div class="playback-artwork">
                <img src="${artwork}">
            </div>
        `);
        $('.playback-title').html(`<h1>${song.name}</h1>`);
        $('.playback-artist').html(`${song.artist}`);
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

    changeView: (id, album, artist) => {
        var view;
        switch(id) {
            case 'artists':
                view = View.artists();
                break;
            case 'albums':
                view = View.albums();
                break;
            case 'album':
                view = View.album(album, artist);
                break;
            case 'playlists':
                view = View.playlists();
                break;
            default:
                view = View.albumsByArtist(id);
                break;
        }
        ViewManager.viewStack.push($('.player').children());
        $('.view-container, .back-button, .nav-header-title').removeClass('slide-in-left');
        $('.view-container, .back-button').addClass('slide-in-right');
        $('.player').empty().append(view);
    },

    populateResults: () => {
        var currentAlbum = '';
        var view = '';
        $.each(ViewManager.searchResults, function(index, song) {
            if (currentAlbum !== song.album) {
                var artwork = ApiManager.getArtwork(song.artist, song.album);

                view = view.concat(AlbumView.header(index, artwork, song.artist, song.album));
                currentAlbum = song.album;
            }
            var clickEvent = `AudioManager.playSong('${song.name}', '${song.artist}', '${song.url}', true)`;
            view = view.concat(
                SearchResult.element(clickEvent, song.name, '', song)
            );
        });
        $('.view-container div').append(view);
    }
}
