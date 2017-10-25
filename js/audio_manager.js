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
            createTrack(playList[index]['url']);
            updateTrackInfo(playList[index]['name'], playList[index]['artist'], playList[index]['album']);
        }
        else {
            audio.currentTime = audio.duration;
        }
    },

    previous: () => {
        var audio = document.getElementById("music");
        if (audio.currentTime <= 3 && index > 0) {
            index--;
            createTrack(playList[index]['url']);
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

        myAddListener();
        $(".play").fadeOut("fast", function() {
            $(".pause").fadeIn("fast");
        });
        $(".audio").trigger("play");
        SetVolume(currentVolume);
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
        createTrack(playList[0]['url']);
        updateTrackInfo();
    }
}
