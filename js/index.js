var playlists = [];
var results;
var playList;
var index;
var searchType;
var currentAlbum;
var artist;
var album;
var link;
var track;
var currentVolume = 35;
var viewIndex;

function loadTasks() {
    //getData({type: "album"}, $("#album-browser"));
    ApiManager.getArtistData();
    ApiManager.getAlbumData();
    $("#album-browser, #artist-browser").hide();
    $(".logo-background").delay(2000).fadeOut("fast");
}

$("#playlist-browser").hide();

$("#search").submit(function(event){
    event.preventDefault();
});

function handleMusic(response){
    currentAlbum = null;
    results = JSON.parse(response);
    $(".search-results").hide();
    $(".search-results").empty();
    if (searchType == 'all') {
        $(".search-results").append(
            Button.shuffle('album', 'all')
        );
    }
    $(".search-results").show();
    for (i=0; i<results.length; i++) {
        var artwork = "/SpotiFree/files/music/"+results[i]['artist']+"/"+results[i]['album']+"/Artwork.png";
        var name = results[i]['name'];
        if (/^\d.*\s/.test(name)) {
            name = name.slice(3);
        }
        artist = results[i]['artist'];
        album = results[i]['album'];
        link = results[i]['url'];
        track = results[i]['track'];

        if (name){
            if (album != currentAlbum && searchType != "all") {
                currentAlbum = album;
                $(".search-results").append(
                    AlbumView.header(i, artwork, artist, album)
                );
            } if (searchType != "all") {
                $(".search-results").append(
                    ListItem.inAlbum(i, name, artist, album, link, track, artwork)
                );
            } else {
                $(".search-results").append(
                    ListItem.song(i, name, artist, album, link, track, artwork)
                );
            }
        }
        if (name == $(".audio").attr("name")) {
            $("#"+i).addClass("playing");
        }
    }

    $(document).ready(function() {
        var audioElement = document.createElement('audio');
        audioElement.pause();
        audioElement.addEventListener('ended', function() {
            this.play();
        }, false);

        $(".album-play").click(function() {
            playList = [];
            for (i = 0; i < results.length; i++) {
                if (results[i]['album'] == $(this).attr("name")) {
                    playList.push(results[i]);
                }
            }
            index = 0;
            createTrack(playList[0]['url']);
            updateTrackInfo();
        })

        $(".shuffle").click(function() {
            playList = results;
            if ($(this).attr("value") == "album") {
                playList = [];
                for (i = 0; i < results.length; i++) {
                    if (results[i]['album'] == $(this).attr("name")) {
                        playList.push(results[i]);
                    }
                }
            }
            AudioManager.shuffle();
        });
    });
}

var timeDrag;
$(document).ready(function() {
    //preload mouse down image here via Image()
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
})

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
    track.currentTime = maxduration * percentage / 100;
};

function SetVolume(val)
{
    var player = document.getElementById('music');
    currentVolume = val;
    player.volume = val / 100;
}

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
        $(".playback-time").html("<h3>"+mins+":0"+(secs)+"</h3>");
    } else {
        $(".playback-time").html("<h3>"+mins+":"+(secs)+"</h3>");
    }
}

function updateResults(newResults) {
    results = newResults;
}

function updateTrackInfo() {
    name = playList[index]['name'];
    artist = playList[index]['artist'];
    album = playList[index]['album'];
    artwork = "/SpotiFree/files/music/"+artist+"/"+album+"/Artwork.png";
    $(".controls .cover-bg").css("background","url('"+artwork+"')");
    $(".playback-artwork").replaceWith("<div class='playback-artwork'><img src='"+artwork+"'></div>")
    $(".playback-title").html("<h1>"+name+"</h1>");
    $(".playback-artist").html("<h2>"+artist+"</h2>");
}

function playNextTrack() {
    if (index < playList.length-1) {
        index++;
        updateTrackInfo();
        $(".search-result").each(function() {
        if ($(this).attr("value") == playList[index]['url']){
            $(".search-result").removeClass("playing");
            $(this).addClass("playing");
        }
    })
        var audio = document.getElementById("music");
        audio.src = playList[index]['url'];
        audio.play();
    }
}

$(document).on("click", '.nav-button', function() {
    searchType = null;
    $(".search-results, .view").hide();
    $(".nav-button, .playlist").removeClass("selected");
    if (!$(this).hasClass("selected")) {
        $(this).addClass("selected");
    }
    var id = $(this).attr("id");
    var newViewIndex = $(this).attr("value");
    var view = null;
    var type = null;
    switch (id) {
        case "nav-artists":
            view = $("#artist-browser");
            type = "artist";
            break;
        case "nav-albums":
            view = $("#album-browser");
            type = "album";
            break;
        case "nav-songs":
            view = $("#song-browser");
            type = "song";
            break;
        case "create-playlist":
            view = $("#playlist-creator")
            break;
        case "nav-playlists":
            view = $("#playlist-browser");
            PlaylistManager.populatePlaylists();
            break;
    }

    if (viewIndex > newViewIndex) {
        view.removeClass("slide-in-left slide-in-up").addClass("slide-in-right");
    } else if (viewIndex < newViewIndex) {
        view.removeClass("slide-in-right slide-in-up").addClass("slide-in-left");
    } else {
        view.removeClass("slide-in-right slide-in-left");
        view.addClass("slide-in-up");
    }
    prevView = view;
    $(document).ready(function() {
        view.show();
    })
    viewIndex = newViewIndex;
});
