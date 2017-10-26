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

            handleMusic(data);
        });
    },

    getArtistData: () => {
        var request = ApiManager.newRequest('get_metadata.php', {type: 'artist'});
        var view = $('#artist-browser');

        request.done(function(response){
            var data = JSON.parse(response);
            var len = data.length;

            view.append(Player.header('Artists'));
            for (var i=0; i<len; i++) {
                view.append(ListItem.artist(data[i]['artist']));
            }
        });
    },

    getAlbumData: () => {
        var request = ApiManager.newRequest('get_metadata.php', {type: 'album'});
        var view = $('#album-browser');

        request.done(function(response){
            var data = JSON.parse(response);
            var len = data.length;

            view.append(Player.header('Albums'));
            for (var i=0; i<len; i++) {
                var imgSrc = `/SpotiFree/files/music/${data[i]['artist']}/${data[i]['album']}/Artwork.png`;
                view.append(ListItem.album(data[i]['album'], imgSrc));
            }
        });
    },

    newRequest: (url, data) => {
        return $.ajax({
            url: url,
            type: 'post',
            data: data
        });
    }
}
