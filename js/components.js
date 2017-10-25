var Player = {
    header: function(name) {
        return `
            <div class="header">
                ${name}
            </div>
        `;
    },

    audio: (name, url) => {
        return `
            <audio class="audio" id="music" name="${name}" src="${url}"
             ontimeupdate="setInterval(updateTrackTime(this), 1000)">
            </audio>
        `;
    },

    playlistModal: (name, artist, album, url, artwork) => {
        var view = `
            <div class="playlist-modal">
                ${Player.header('Choose a playlist')}
            </div>
        `;
    }
}

var ListItem = {
    playlist: function(name) {
        return `
            <div class="playlist playlist-item"
             onclick="PlaylistManager.showPlaylist('${name}')">
                ${name}
            </div>
        `;
    },

    song: function(id, name, artwork, artist, album, url, index) {
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

    inAlbum: function(id, name, artist, album, url, index) {
        return `
            <div class="search-result" style="cursor: pointer">
                <div class="search-result-info" id="${id}" value="${url}"
                 name="${id}" onclick="AudioManager.playSong('${name}', '${artist}', '${url}')">
                    <p>${name}</p>
                    <p>${artist} &bull; ${album}</p>
                    <p class="track">${index}</p>
                </div>
                <div class="add" value="${url}" onclick="getPlaylists()">
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
