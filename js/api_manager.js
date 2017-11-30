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

            ViewManager.viewSearchResults(JSON.parse(data));
        });
    },

    getArtistData: () => {
        var request = ApiManager.newRequest('get_metadata.php', {type: 'artist'});
        var view = $('#artist-browser');

        request.done(function(response){
            var data = JSON.parse(response);
            var len = data.length;
            var viewSection = `<div class="view-section">`

            view.append(Player.header('Artists'));
            for (var i=0; i<len; i++) {
                viewSection = viewSection.concat(ListItem.artist(data[i]['artist']));
            }
            viewSection = viewSection.concat(`</div>`);
            view.append(viewSection);
        });
    },

    getAlbumData: () => {
        var request = ApiManager.newRequest('get_metadata.php', {type: 'album'});
        var view = $('#album-browser');

        request.done(function(response){
            var data = JSON.parse(response);
            var len = data.length;
            var viewSection = `<div class="view-section">`;

            view.append(Player.header('Albums'));
            for (var i=0; i<len; i++) {
                var imgSrc = `/SpotiFree/files/music/${data[i]['artist']}/${data[i]['album']}/Artwork.png`;
                viewSection = viewSection.concat(`${ListItem.album(data[i]['album'], imgSrc)}`);
            }
            viewSection = viewSection.concat(`</div>`);
            view.append(viewSection);
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
