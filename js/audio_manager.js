var AudioManager = {
    playSong: (name, artist, url, fromQueue = false) => {
        playList = results;

        if (!fromQueue) {
            for (i=0; i<playList.length; i++) {
                if (url == playList[i]['url']){
                    index = i;
                }
            }
        }
        updateTrackInfo();
        AudioManager.setupAudio(name, artist, url);
    },

    resume: () => {
        $(".play").hide();
        $(".pause").show();
        $(".audio").trigger("play");
    },

    pause: () => {
        $(".pause").hide();
        $(".play").show();
        $(".audio").trigger("pause");
    },

    skip: () => {
       var audio = document.getElementById("music");
       var song;
       var album;
       var fromQueue = false;

        if (index < playList.length-1) {
            if (queue.length > 0) {
                song = queue.pop();
                album = song['album'];
                fromQueue = true;
            } else {
                index++;
                song = playList[index];
                album = playList[index]['album'];
            }
            AudioManager.playSong(song['name'], song['artist'], song['url'], fromQueue);
            updateTrackInfo(song['name'], song['artist'], album);
        }
        else {
            audio.currentTime = audio.duration;
        }
    },

    previous: () => {
        var audio = document.getElementById("music");
        if (audio.currentTime <= 3 && index > 0) {
            index--;
            var song = playList[index];
            AudioManager.playSong(song['name'], song['artist'], song['url']);
            updateTrackInfo();
        }
        else {
            audio.currentTime = 0;
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

        document.getElementById('music').addEventListener(
            'ended', AudioManager.skip, false
        );

        $(".play").fadeOut("fast", function() {
            $(".pause").fadeIn("fast");
        });
        $(".audio").trigger("play");
        SetVolume(currentVolume);
    },

    setVolume(val) {
        var player = document.getElementById('music');
        currentVolume = val;
        player.volume = val/100;
    },

    addToQueue: (name, artist, album, artwork, url) => {
       queue.push({name: name, artist: artist, album, artwork: artwork, url: url});
    },

    shuffle: () => {
        var currentIndex = playList.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = playList[currentIndex];
            playList[currentIndex] = playList[randomIndex];
            playList[randomIndex] = temporaryValue;
        }
        index = 0;
        AudioManager.playSong(playList[0]['name'], playList[0]['artist'], playList[0]['url']);
        updateTrackInfo();
    }
}
