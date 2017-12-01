var AudioManager = {
    playlist: [],
    inQueue: 0,
    index: 0,
    volume: localStorage.volume ? parseInt(localStorage.volume) : 35,

    playSong: (name, artist, url, isNewPlaylist = false) => {
        if (isNewPlaylist) {
            AudioManager.playlist = ViewManager.searchResults;
            $.each(ViewManager.searchResults, function(index, song) {
                if (url == song.url) {
                    AudioManager.index = index;
                }
            });
        }
        AudioManager.setupAudio(name, artist, url);
        ViewManager.updatePlayerState();
        AudioManager.updateQueue();
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
        $('.search-result').removeClass('playling');
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

        $(".play").fadeOut("fast", function() {
            $(".pause").fadeIn("fast");
        });
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
    },

    resume: () => {
        var audio = document.getElementById('music');
        if (!audio && AudioManager.inQueue) {
            AudioManager.restartPlaylist();
        } else {
            $(".play").hide();
            $(".pause").show();
            $(".audio").trigger("play");
        }
    },

    pause: () => {
        $(".pause").hide();
        $(".play").show();
        $(".audio").trigger("pause");
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
    }
}
