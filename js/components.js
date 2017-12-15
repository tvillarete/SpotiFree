var Player = {
    init: () => {
        ApiManager.getArtistData();
        ApiManager.getAlbumData();
        View.init();
        Controls.init();
        $(".logo-background").delay(2000).fadeOut("fast");
        if (localStorage.volume) {
            var volume = parseInt(localStorage.volume);
            $('#vol-control').val(volume);
        }
        document.onkeydown = AudioManager.checkKey;
    },

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

    searchbar: () => {
        return `
            <form id="library-search" action="#" onsubmit="ViewManager.changeView('search', this)">
                <input autocomplete="off" autocorrect="off" autocapitalize="off"
                 class="searchbar" type=text" placeholder="Search">
            </form>
        `;
    },

    progressBar: () => {
        return `
            <div class="section progress-bar">
                <div class="progress">
                    <div class="progress-bar-handle"></div>
                </div>
            </div>
        `;

    },

    playlistModal: (name, artist, album, url, artwork) => {
        PlaylistManager.getPlaylists();
        var view = `
            <div class="disabled"></div>
            <div class="playlist-selector">
                ${Player.header('Choose a playlist')}
        `;
        $.each(PlaylistManager.playlists, function(index, playlist) {
            view = view.concat(`
                ${Button.playlistSelection(playlist.name, name, artist, album, url, artwork)}
            `);
        })
        view = view.concat(`${Button.closePlaylistModal()}`)
        return view;
    }
}

var SearchResult = {
    element: (options, clickEvent, text) => {
        clickEvent = options.clickEvent ? options.clickEvent : clickEvent;
        return `
            <div class="search-result ${options.classes} ${options.isPlaying ? options.isPlaying : ''}" id="${options.id}">
                <div class="result-info" onclick="${clickEvent}">
                    ${SearchResult.artwork(options.artwork)}
                    ${SearchResult.text(options.text ? options.text : text)}
                </div>
                <div class="result-options">
                    ${SearchResult.options(options.song)}
                </div>
            </div>
        `;
    },

    text: text => {
        return `
            <p>${text}</p>
        `;
    },

    artwork: url => {
        return url ? `<img class="artwork" src="${url}">` : '';
    },

    options: song => {
        if (!song) {
            return '';
        }
        var artwork = ApiManager.getArtwork(song.artist, song.album);
        return `
            <div class="song-option-button add-to-queue" onclick="AudioManager.addToQueue(
                '${song.name}', '${song.artist}', '${song.album}', ${song.track}, '${song.url}'
            )">Queue</div>
            <div class="song-option-button add" onclick="PlaylistManager.showSelector(
                '${song.name}', '${song.artist}', '${song.album}', '${song.url}', '${artwork}'
            )">
                <img src="/SpotiFree/files/images/playlist_add.png">
            </div>
        `;
    }
}

var Button = {
    shuffle: (type=null, name=null) => {
        return `
            <div class="shuffle" value=${type} onclick="${type == 'playlist' ?
             'shufflePlaylist('+name+')' : ''}">
                <p>Shuffle Play</p>
            </div>
        `;
    },

    actionButton: (options) => {
        return `
            <div class="button action-button" onclick="${options.clickEvent}">
                ${options.text}
            </div>
        `;
    },

    playbackButton: (className, clickEvent, imgSrc) => {
        return `
            <div class="playback-button ${className}" onclick="${clickEvent}">
                <img src="files/images/${imgSrc}">
            </div>
        `;
    },

    album: (name, artist) => {
        var imgSrc = ApiManager.getArtwork(artist, name);
        return `
            <div class="album-item" onclick="ViewManager.changeView('album', '${name}', '${artist}')">
                <img src="${imgSrc}">
                <p>${name}</p>
            </div>
        `;
    },

    playlistSelection: (playlist, name, artist, album, url, artwork) => {
        return `
            <div class="search-result"
             onclick="PlaylistManager.addToPlaylist('${playlist}', '${name}',
              '${artist}', '${album}', '${url}', '${artwork}')">
                <div class="result-info">
                    <p>${playlist}</p>
                </div>
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
                <div class="album-head-bg" style="background: url('${artwork}')">
                    <img src="${artwork}">
                </div>
                <div class="album-img" id="album-${id}">
                    <img class="artwork" src="${artwork}">
                    <div class="album-play" name="${album}" onclick="AudioManager.playAlbum('${album}')">
                        <img src="/SpotiFree/files/images/play_arrow.svg">
                    </div>
                </div>
                <div class="album-info">
                    <h3>${album}</h3>
                    <h6>${artist}</h6>
                    <div class="shuffle" onclick="AudioManager.playAlbum('${album}', true)">
                        <p>Shuffle Play</p>
                    </div>
                </div>
            </div>
        `;
    }
}

var Controls = {
    init: () => {
        $('body').append(Controls.element());
        Controls.bindEvents();
    },

    toggleFullscreen: () => {
        $('.controls').toggleClass('fullscreen');
        $('.disabled').fadeToggle();
    },

    bindEvents: () => {
        var timeDrag;
        $(".progress-bar, .progress-bar > div, .progress-bar-handle").bind('mousedown touchstart', function(e){
            timeDrag = true;
            updatebar(e.pageX);
            $(".progress-bar").addClass("scrubbing");
        }).bind('mouseup touchend', function(e){
            if(timeDrag) {
                timeDrag = false;
                updatebar(e.pageX);
                $(".progress-bar").removeClass("scrubbing");
            }
        }).bind('mousemove touchmove', function(e) {
            if(timeDrag) {
                updatebar(e.pageX);
            }
        })
    },

    element: () => {
        return `
            <div class="controls">
                ${Controls.mini()}
                <div class="controls-fullscreen-container">
                    ${Controls.fullArtwork()}
                    ${Controls.progressBar()}
                    ${Controls.fullscreenInfo()}
                    ${Controls.playbackControls()}
                    ${Controls.volume()}
                </div>
            </div>
            <div class="disabled controls-disabled" style="display: none;"
             onclick="Controls.toggleFullscreen()"></div>
        `;
    },

    mini: () => {
        return `
            <div id="mini-controls">
                <div id="song-info-container" onclick="Controls.toggleFullscreen()">
                    <div class="artwork-container">
                        <img src="/SpotiFree/files/music/Coldplay/All I Can Think About Is You/Artwork.png">
                    </div>
                    <div class="song-title">Kaleidoscope</div>
                </div>
                <div id="playback-container">
                    ${Button.playbackButton('play', 'AudioManager.resume()', 'play_arrow.svg')}
                    ${Button.playbackButton('pause hidden', 'AudioManager.pause()', 'pause.svg')}
                    ${Button.playbackButton('', 'AudioManager.skip()', 'skip_next.svg')}
                </div>
                <div class="playback-button" id="arrow-down" onclick="Controls.toggleFullscreen()">&times;</div>
            </div>
        `;
    },

    fullArtwork: () => {
        return `
            <div id="artwork-fullscreen">
                <img src="/SpotiFree/files/music/Coldplay/All I Can Think About Is You/Artwork.png">
            </div>
        `;
    },

    progressBar: () => {
        return `
            <div class="progress-bar">
                <div class="progress">
                    <div class="progress-bar-handle"></div>
                </div>
            </div>
            <div class="track-time-container">
                <div id="current-time">0:00</div>
                <div id="max-time">3:15</div>
            </div>
        `;
    },

    fullscreenInfo: () => {
        return `
            <div class="song-info-container">
                <div class="song-title">Kaleidoscope</div>
                <div class="song-album">A Head Full of Dreams</div>
            </div>
        `;
    },

    playbackControls: () => {
        return `
            <div class="playback-fullscreen-container">
                ${Button.playbackButton('', 'AudioManager.previous()', 'skip_previous.svg')}
                ${Button.playbackButton('play', 'AudioManager.resume()', 'play_arrow.svg')}
                ${Button.playbackButton('pause hidden', 'AudioManager.pause()', 'pause.svg', true)}
                ${Button.playbackButton('', 'AudioManager.skip()', 'skip_next.svg')}
            </div>
        `;
    },

    volume: () => {
        return `
            <input class="volume-bar" id="vol-control" type="range" min="0" value="35" max="100" step="1"
             oninput="AudioManager.setVolume(this.value)" onchange="AudioManager.setVolume(this.value)">
        `;
    }
}
