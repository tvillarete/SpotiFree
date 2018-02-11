var ApiManager = {
    search: (query = null) => {
        $('.searchbar').blur();
        if (query)
            $('.searchbox').val(query);

        var data = $('#search').serialize();
        var request = $.ajax({
            url: 'php/get_music.php',
            type: 'post',
            data: data
        });

        request.done(function(data){
            $('.view').hide();
            $('.search-results').empty().show();

            ViewManager.searchResults = JSON.parse(data);
            ViewManager.populateResults();
        });
    },

    getArtistData: () => {
        ApiManager.newRequest(
            'php/get_metadata.php',
            {type: 'artist'}).done(function(response) {
                var item = JSON.parse(response);
                $.each(item, function(index, item) {
                    var artist = item.artist;
                    AudioManager.artists.push(artist);
                });
            });
    },

    getAlbumData: () => {
        ApiManager.newRequest(
            'php/get_metadata.php',
            {type: 'album'}).done(function(response) {
                var data = JSON.parse(response);
                $.each(data, function(index, data) {
                    data = {
                        name: data.album,
                        artist: data.artist
                    }
                    AudioManager.albums.push(data);
                });
            });
    },

    getArtwork: (artist, album) => {
        return `/SpotiFree/files/music/${artist}/${album}/Artwork.png`;
    },

    getTimeText: (time) => {
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = time % 60;
        secs = Number((secs).toFixed(0));

        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    newRequest: (url, data) => {
        return $.ajax({
            url: url,
            type: 'post',
            data: data
        });
    }
}
