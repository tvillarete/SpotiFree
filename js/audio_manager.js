var AudioManager = {
    artists: [],
    albums: [],
    playlist: [],
    inQueue: 0,
    index: 0,
    isPlaying: false,
    volume: localStorage.volume ? parseInt(localStorage.volume) : 35,

    playSong: (name, artist, url, isNewPlaylist = false) => {
        if (isNewPlaylist) {
            AudioManager.playlist = ViewManager.searchResults;
            $.each(ViewManager.searchResults, function(index, song) {
                if (url == song.url) {
                    AudioManager.index = index;
                    ViewManager.addToRecentlyPlayed(song);
                }
            });
        }
        AudioManager.setupAudio(name, artist, url);
        ViewManager.updatePlayerState();
        AudioManager.updateQueue();
        AudioManager.isPlaying = true;
    },

    updateQueue: () => {
        if (AudioManager.getSongAtIndex().queue) {
            AudioManager.playlist.splice(AudioManager.index, 1);
            AudioManager.index--;
            AudioManager.inQueue--;
        }
    },

    setupAudio: (name, artist, url) => {
        $('.audio').remove();
        $('.search-result').removeClass('playing');
        var newIndex;

        $('.search-result-info').each(function() {
            if ($(this).attr("value") == url){
                $(".search-result-info").removeClass("playing");
                $(this).addClass("playing");
            }
        });

        $(".controls").append(
            Player.audio(name, url)
        );

        var audio = document.getElementById('music');

        audio.addEventListener(
            'ended', AudioManager.skip, false
        );
        audio.volume = AudioManager.volume/100;

        $(".play").addClass('hidden');
        $(".pause").removeClass('hidden');
        $(".audio").trigger("play");
    },

    getSongAtIndex: (index = false) => {
        index = index ? index : AudioManager.index;
        return AudioManager.playlist[index];
    },


    playAlbum: (album, shuffle = false) => {
        AudioManager.playlist = [];

        $.each(ViewManager.searchResults, function(index, song) {
            if (song.album == album) {
                AudioManager.playlist.push(song);
            }
        });
        if (shuffle) {
            AudioManager.shuffle();
        } else {
            AudioManager.restartPlaylist();
        }
    },

    restartPlaylist: () => {
        AudioManager.index = 0;
        var song = AudioManager.getSongAtIndex();
        AudioManager.playSong(song.name, song.artist, song.url, false);
        AudioManager.isPlaying = true;
    },

    resume: () => {
        var audio = document.getElementById('music');
        if (!audio && AudioManager.inQueue) {
            AudioManager.restartPlaylist();
        } else {
            $(".play").addClass('hidden');
            $(".pause").removeClass('hidden');
            $(".audio").trigger("play");
        }
        AudioManager.isPlaying = true;
    },

    pause: () => {
        $(".pause").addClass('hidden');
        $(".play").removeClass('hidden');
        $(".audio").trigger("pause");
        AudioManager.isPlaying = false;
    },

    skip: () => {
       var audio = document.getElementById("music");

        if (AudioManager.index < AudioManager.playlist.length-1) {
            AudioManager.index++;
            var song = AudioManager.getSongAtIndex();
            AudioManager.playSong(song.name, song.artist, song.url);
        }
        else {
            audio.currentTime = audio.duration;
        }
    },

    previous: () => {
        var audio = document.getElementById("music");
        if (audio.currentTime <= 3 && AudioManager.index > 0) {
            AudioManager.index--;
            var song = AudioManager.getSongAtIndex();
            AudioManager.playSong(song.name, song.artist, song.url);
        }
        else {
            audio.currentTime = 0;
        }
    },

    setVolume(val) {
        var audio = document.getElementById('music');
        if (audio) {
            audio.volume = val/100;
        }
        AudioManager.volume = val;
        localStorage.volume = val;
    },

    shuffle: () => {
        var currentIndex = AudioManager.playlist.length;
        var temp;
        var randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temp = AudioManager.playlist[currentIndex];
            AudioManager.playlist[currentIndex] = AudioManager.playlist[randomIndex];
            AudioManager.playlist[randomIndex] = temp;
        }
        index = 0;
        AudioManager.restartPlaylist();
    },

    addToQueue: (name, artist, album, index, url) => {
        var song = {
            name: name,
            artist: artist,
            album: album,
            track: index,
            url: url,
            queue: true
        }
        var index = AudioManager.index + 1 + AudioManager.inQueue++;
        AudioManager.playlist.splice(index, 0, song);
        ViewManager.displayToast('files/images/queue.png', 'Added to Queue');
    },

    checkKey: e => {
        if (!$('input').is(':focus')) {
            if (e.keyCode === 37 && AudioManager.isPlaying) {
                e.preventDefault();
                AudioManager.previous();
            } else if (e.keyCode === 39 && AudioManager.isPlaying) {
                e.preventDefault();
                AudioManager.skip();
            } else if (e.keyCode === 0 || e.keyCode === 32 ) {
                    e.preventDefault();
                    if (AudioManager.isPlaying) {
                        AudioManager.pause();
                    } else {
                        AudioManager.resume();
                    }
            } else if (e.keyCode === 8) {
                e.preventDefault();
                ViewManager.back();
            }
        }
    }
}

//update Progress Bar control
var updatebar = function(x) {
    var progress = $('.progress-bar');
    var track = document.getElementById("music");
    var currentTime = track.currentTime;
    var maxduration = Math.floor(track.duration);
    var position = x - progress.offset().left; //Click pos
    var percentage = 100 * position / progress.width();

    //Check within range
    if(percentage > 100) {
        percentage = 100;
    }
    if(percentage < 0) {
        percentage = 0;
    }

    //Update progress bar and video currenttime
    $('.progress-bar > div').css('width', percentage+'%');
    $('.progress-bar-handle').css('left', percentage+'%');
    track.currentTime = maxduration * percentage / 100;
};

function updateTrackTime(track){
    var time = track.currentTime;
    var duration = Math.floor(track.duration);
    var width = Math.floor(track.currentTime)/duration*100;
    var mins = ~~(time / 60);
    var secs = time % 60;

    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;
    secs = Number((secs).toFixed(0));
    $(".progress").css("width",""+width+"%");
    if (secs < 10) {
        $("#current-time").text(`${mins}:0${secs}`);
    } else {
        $("#current-time").text(`${mins}:${secs}`);
    }
}
