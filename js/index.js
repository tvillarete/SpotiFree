function loadTasks() {
    ApiManager.getArtistData();
    ApiManager.getAlbumData();
    View.init();
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
