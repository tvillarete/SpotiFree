var playlists = [];
var searchType;
var currentVolume = 35;
var viewIndex;

function loadTasks() {
    //getData({type: "album"}, $("#album-browser"));
    ApiManager.getArtistData();
    ApiManager.getAlbumData();
    $("#album-browser, #artist-browser").hide();
    $(".logo-background").delay(2000).fadeOut("fast");
    if (localStorage.volume) {
        var volume = parseInt(localStorage.volume);
        $('#vol-control').val(volume);
    }
}

$("#playlist-browser").hide();

$("#search").submit(function(event){
    event.preventDefault();
});

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
