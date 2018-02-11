var Player = {
    init: () => {
        ApiManager.getArtistData();
        ApiManager.getAlbumData();
        View.init();
        Controls.init();
        AudioManager.getState();
        ViewManager.updatePlayerState();
        $(".logo-background").delay(2000).fadeOut("fast");
        if (localStorage.volume) {
            var volume = parseInt(localStorage.volume);
            $('#vol-control').val(volume);
        }
        document.onkeydown = AudioManager.checkKey;
        document.addEventListener('touchstart', function(){}, true);
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
    element: (options, clickEvent, text, showArrow) => {
        clickEvent = options.clickEvent ? options.clickEvent : clickEvent;
        var arrow = '<p class="nav-arrow">&rsaquo;</p>';
        return `
            <div class="search-result ${options.classes} ${options.isPlaying ? 'song-playing' : ''}" id="${options.id}">
                <div class="result-info" onclick="${clickEvent}">
                    ${SearchResult.artwork(options.artwork)}
                    ${options.subtext ? SearchResult.textSubtext(options.text, options.subtext) :
                     SearchResult.text(options.text ? options.text : text)}
                </div>
                <div class="result-options">
                    ${SearchResult.options(options.song)}
                    ${options.arrow || showArrow ? arrow : ''}
                </div>
            </div>
        `;
    },

    text: text => {
        return `
            <p>${text}</p>
        `;
    },

    textSubtext: (text, subtext) => {
        return `
            <div class="result-text-container">
                ${SearchResult.text(text)}
                ${SearchResult.text(subtext)}
            </div>
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
            <div class="song-option-button add-to-queue"
             onclick="PopupDialog.init('${song.name}', '${song.artist}', '${song.album}', '${song.track}', '${song.url}')">
                <img src="files/images/dots.svg">
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
        $('.main').append(Controls.element());
        Controls.bindEvents();
    },

    toggleFullscreen: (value) => {
        if (value === 'off') {
            $('.controls').removeClass('fullscreen');
        } else {
            $('.controls').toggleClass('fullscreen');
            if ($('.controls').hasClass('fullscreen')) {
                ViewManager.toggleControlsDisabled('on');
            }
        }
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
        `;
    },

    mini: () => {
        return `
            <div id="mini-controls">
                <div id="song-info-container" onclick="ViewManager.toggleControlsDisabled(); Controls.toggleFullscreen()">
                    <div class="artwork-container">
                        <img src="/SpotiFree/files/images/logo.png">
                    </div>
                    <div class="song-title">SpotiFree</div>
                </div>
                <div id="playback-container">
                    ${Button.playbackButton('play', 'AudioManager.resume()', 'play_arrow.svg')}
                    ${Button.playbackButton('pause hidden', 'AudioManager.pause()', 'pause.svg')}
                    ${Button.playbackButton('', 'AudioManager.skip()', 'skip_next.svg')}
                </div>
                <div class="playback-button" id="arrow-down" onclick="ViewManager.toggleControlsDisabled('off')">&times;</div>
            </div>
        `;
    },

    fullArtwork: () => {
        return `
            <div id="artwork-fullscreen">
                <img src="/SpotiFree/files/images/logo.png">
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
                <div id="max-time">0:00</div>
            </div>
        `;
    },

    fullscreenInfo: () => {
        return `
            <div class="song-info-container">
                <div class="song-title">SpotiFree</div>
                <div class="song-album">By Tanner Villarete</div>
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

var searchResultOptions = (song) => {
    return {
        buttons: {
            0: {
                text: 'Add to Queue',
                clickEvent: `AudioManager.addToQueue(
                    '${song.name}', '${song.artist}', '${song.album}', '${song.track}', '${song.url}'
                )`
            },
            1: {
                text: 'Add to Playlist',
                clickEvent: `PlaylistManager.showSelector(
                    '${song.name}', '${song.artist}', '${song.album}', '${song.url}'
                )`
            },
            2: {
                text: 'View Artist',
                clickEvent: `ViewManager.changeView('${song.artist}')`
            },
            3: {
                text: 'View Album',
                clickEvent: `ViewManager.performSearch('${song.album}')`
            },
        }
    }
}

var PopupDialog = {
    init: (name, artist, album, track, url) => {
        var song = {
            name: name,
            artist: artist,
            album: album,
            track: track,
            url: url
        }
        var options = searchResultOptions(song);
        ViewManager.togglePopupDisabled('on');
        $('body').append(PopupDialog.element(options));
    },

    element: (options) => {
        var buttons = '';
        $.each(options.buttons, function(index, button) {
            buttons = buttons.concat(
                PopupDialog.optionButton(button.text, button.clickEvent)
            );
        })
        return `
            <div class="popup-dialog ${options.className}">
                ${buttons}
                ${PopupDialog.cancelButton()}
            </div>
        `;
    },

    optionButton: (text, clickEvent) => {
        return `
            <div class="popup-option" onclick="${clickEvent}; ViewManager.togglePopupDisabled('off')">
                ${text}
            </div>
        `;
    },

    cancelButton: () => {
        return `
            <div class="popup-cancel-button" onclick="ViewManager.togglePopupDisabled('off')">
                Cancel
            </div>
        `;
    },

    remove: () => {
        $('.popup-dialog').animate({
            bottom: '-=1000'
        }, 250, function() {
            $('.popup-dialog').remove();
        });
    }
}
