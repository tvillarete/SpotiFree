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
        if (localStorage.playlists) {
            playlists = JSON.parse(localStorage.playlists);
        }
        var view = `
            <div class="disabled"></div>
            <div class="playlist-selector">
                ${Player.header('Choose a playlist')}
        `;
        for (var i=0; i< playlists.length; i++) {
            view = view.concat(`
                ${ListItem.playlistSelection(playlists[i][0], name, artist, album, url, artwork)}
            `);
        }
        view = view.concat(`${Button.closePlaylistModal()}`)
        return view;
    }
}

var ListItem = {
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

    song: function(id, name, artwork, artist, album, url, index, artwork) {
        return `
            <div class="search-result">
                <img class="artwork" src="${artwork}">
                <div id="${id}" value="${url}" name="${id}">
                    <p>${name}</p> &bull; ${album}</p>
                    <p class="track">${index}></p>
                </div>
                <div class="add" value="${url}"
                 onclick="PlaylistManager.showSelector(
                     '${name}', '${artist}', '${album}', '${url}', '${artwork}'
                 )">
                    <img src="SpotiFree/files/images/playlist_add.png">
                </div>
            </div>
        `;
    },

    inAlbum: function(id, name, artist, album, url, index, artwork) {
        return `
            <div class="search-result in-album" style="cursor: pointer">
                <div class="search-result-info" id="${id}" value="${url}"
                 name="${id}" onclick="AudioManager.playSong('${name}', '${artist}', '${url}')">
                    <!--<p class="track">${index}</p>-->
                    <p class="track">${name}</p>

                </div>
                <div class="add" value="${url}"
                 onclick="PlaylistManager.showSelector(
                     '${name}', '${artist}', '${album}', '${url}', '${artwork}'
                 )">
                    <img src="/SpotiFree/files/images/playlist_add.png">
                </div>
            </div>
        `;
    },

    inPlaylistBrowser: () => {
        return `
            <div class="search-result" onclick="">

            </div>
        `;
    },

    inPlaylist: function(id, playlist, artwork, name, artist, album, url, index) {
        return `
            <div class="search-result" id=${id} value=${url} name=${id}
             onclick="AudioManager.playSong('${name}', '${artist}', '${url}')">
                <img class="artwork" src="${artwork}">
                <div id="${id}" value="${url}" name="${id}">
                    <p>${name}</p>
                    <p>${artist} &bull; ${album}</p>
                    <p class="track">${index}</p>
                </div>
                <div class="remove" name="${playlist}">
                    <!-- Remove goes here -->
                </div>
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
                <div class="album-head-bg" id="album-head-bg-${id}">
                    <img src="${artwork}">
                </div>
                <div class="album-img" id="album-${id}">
                    <img src="${artwork}">
                    <div class="album-play" name="${album}">
                        <img src="/SpotiFree/files/images/play_arrow.svg">
                    </div>
                </div>
                <div class="album-info">
                    <h3>${album}</h3>
                    <h6>${artist}</h6>
                <div class="shuffle" value="album" name="${album}">
                    <p>Shuffle Play</p>
                </div>
            </div>
        `;
    }
}