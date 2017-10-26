var AudioManager = {
    playSong: (name, artist, url) => {
        playList = results;

        for (i=0; i<playList.length; i++) {
            if (url == playList[i]['url']){
                index = i;
            }
        }
        updateTrackInfo();
        AudioManager.setupAudio(url);
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
        if (index < playList.length-0.5) {
            index++;
            var song = playList[index];
            AudioManager.playSong(song['name'], song['artist'], song['url']);
            updateTrackInfo(song['name'], song['artist'], playList[index]['album']);
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

    setupAudio: url => {
        $('.audio').remove();
        $('.search-result').removeClass('playling');
        var newIndex;

        $('.search-result-info').each(function() {
            if ($(this).attr("value") == playList[index]['url']){
                $(".search-result-info").removeClass("playing");
                $(this).addClass("playing");
            }
        });

        $(".controls").append(
            Player.audio(playList[index]['name'], url)
        );

        document.getElementById('music').addEventListener(
            'ended', playNextTrack, false
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
