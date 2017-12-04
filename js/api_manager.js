var ApiManager = {
    search: (query = null) => {
        if (query)
            $('.searchbox').val(query);

        var data = $('#search').serialize();
        var request = $.ajax({
            url: 'get_music.php',
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
            'get_metadata.php',
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
            'get_metadata.php',
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

    newRequest: (url, data) => {
        return $.ajax({
            url: url,
            type: 'post',
            data: data
        });
    }
}
