var ViewManager = {
    searchResults: [],

    viewSearchResults: results => {
        var currentAlbum;
        var searchResults = $('.search-results');

        ViewManager.searchResults = [];
        $.each(results, function(index, song) {
            ViewManager.searchResults.push(song);
            var artwork = ApiManager.getArtwork(song.artist, song.album);
            song.name = song.name.slice(3);

            if (song.album != currentAlbum) {
                currentAlbum = song.album;
                searchResults.append(
                    AlbumView.header(index, artwork, song.artist, song.album)
                );
            }
            searchResults.append(
                ListItem.inAlbum(index, song.name, song.artist, song.album, song.url, song.track, artwork)
            );
        });
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
    }
}
