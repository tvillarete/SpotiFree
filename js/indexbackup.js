var playlists = [];
var request;
var results;
var playList;
var index;
var searchType;
var currentAlbum;
var artist;
var album;
var link;
var track;
var currentVolume = 50;
var viewIndex;
var prevView;

function loadTasks() {
    getData({type: "album"}, $("#album-browser"));
    getData({type: "artist"}, $("#artist-browser"));
    populatePlaylists();
    $("#album-browser, #artist-browser").hide();
    $(".loading-bar").fadeOut("fast");
    $(".logo-background").delay(2000).fadeOut("fast");
}

$("#playlist-browser").hide();

function populatePlaylists() {
    if (localStorage.playlists) {
        playlists = JSON.parse(localStorage.playlists);

        for (i=0; i<playlists.length; i++) {
            $("#playlist-browser").empty().append(`
                ${Player.header("Playlists")}
                <div class="nav-button action-button" id="create-playlist">
                    <h2>Create Playlist</h2>
                </div>
                ${ListItem.playlist(playlists[i][0])}
            `);
        }

        $(".playlist").click(function() {
            $(".view").hide();
            $('.search-results').empty();
            $(".search-results").show();
            showPlaylist($(this).attr("name"));
        });
    }
}

$("#search").submit(function(event){
    $(".loading-bar").show();
    $(".view").hide();
    $('.search-results').empty();
    $(".search-results").show();
    event.preventDefault();
    if (request) {
        request.abort();
    }
    var $form = $(this);
    var $inputs = $form.find("input, select, button, textarea");
    var serializedData = $form.serialize();
    $inputs.prop("disabled", true);

    request = $.ajax({
        url: "get_music.php",
        type: "post",
        data: serializedData,
    });

    request.done(function (response){
        $(".loading-bar").fadeOut("fast");
        handleMusic(response);
    });

    function handleMusic(response){
        currentAlbum = null;
        results = JSON.parse(response);
        $(".search-results").hide();
        $(".search-results").empty();
        if (searchType == 'all') {
            $(".search-results").append(
                Button.shuffle()
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
                        ListItem.inAlbum(i, name, artist, album, link, track)
                    );
                } else {
                    $(".search-results").append(
                        ListItem.song(i, name, artist, album, link, track)
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

            $('.search-result-info').click(function() {
                $(".search-result-info").removeClass("playing");
                $(this).addClass("playing");
                playMusic($(this));
            });

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
                shuffle();
            });
        });
    }

    request.always(function () {
        $inputs.prop("disabled", false);
    });
});

function shuffle() {
    var currentIndex = playList.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = playList[currentIndex];
        playList[currentIndex] = playList[randomIndex];
        playList[randomIndex] = temporaryValue;
    }
    index = 0;
    createTrack(playList[0]['url']);
    updateTrackInfo();
}

function playMusic(element) {
    if (element.attr("class") == "add") {
        var url = element.attr("value");
        var data = {type: "playlist", link: url};
        var info;
        request = $.ajax({
            url: "get_metadata.php",
            type: "post",
            data: data,
        });

        request.done(function(response) {
            getPlaylists();
            $(".search-results").show();
            $(".playlist-choice").click(function() {
                var name = $(this).attr("name");
                for (i=0; i<playlists.length; i++) {
                    if (playlists[i][0] == name) {
                        playlists[i].push(JSON.parse(response));
                    }
                }
                localStorage.playlists = JSON.stringify(playlists);
                $(".playlist-selector, .disabled").hide();
            });
        });
    } else if (element.attr("class") == "remove") {
        var name = element.attr("name");
        for (i=0; i<playlists.length; i++) {
            if (playlists[i][0] == name) {
                playlists[i].splice($.inArray(name, playlists[i][2]), 1);
            }
        }
        localStorage.playlists = JSON.stringify(playlists);
        showPlaylist(name);
    } else {
        $(".controls").addClass("shown");
        $(".player").css("padding-bottom", "11em");
        playList = results;
        var songPath = element.attr("value");
        var name = element.find('div:nth-child(1)').text();
        var artist = element.find('div:nth-child(2)').text();
        for (i=0; i<playList.length; i++) {
            if (element.attr("value") == playList[i]['url']){
                index = i;
            }
        }
        updateTrackInfo();
        createTrack(songPath);
    }
}

function getPlaylists() {
    $(".view, .search-results").hide();
    $(".playlist-selector").empty();
    $(".playlist-selector").append("</div><h1>Choose a playlist</h1>");
    for (i=0; i<playlists.length; i++) {
        var name = playlists[i][0];
        $(".playlist-selector").append("<div class='playlist-choice' name='"+name+"'><p>"+name+"</p></div>");
    }
    $(".playlist-selector").append("<div class='cancel-button'><p>Cancel</p></div>");
    $(".playlist-selector, .disabled").show();
    $(".cancel-button").click(function() {
        $(".playlist-selector, .disabled").hide();
    })
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

$(".play, .search-result").click(function(){
    $(".play").hide();
    $(".pause").show();
    $(".audio").trigger("play");
});

$(".pause").click(function() {
    $(".pause").hide();
    $(".play").show();
    $(".audio").trigger("pause");
})

$(".skip-previous").click(function(){
    var audio = document.getElementById("music");
    if (audio.currentTime <= 5 && index > 0) {
        index--;
        createTrack(playList[index]['url']);
        updateTrackInfo();
    }
    else {
        audio.currentTime = 0;
    }
});

$(".skip-next").click(function(){
    var audio = document.getElementById("music");
    if (index < playList.length-0.5) {
        index++;
        createTrack(playList[index]['url']);
        updateTrackInfo(playList[index]['name'], playList[index]['artist'], playList[index]['album']);
    }
    else {
        audio.currentTime = audio.duration;
    }
});

function createTrack(url) {
    $(".audio").remove();
    $(".search-result").removeClass("playing");
    var newIndex;
    $(".search-result-info").each(function() {
        if ($(this).attr("value") == playList[index]['url']){
            $(".search-result-info").removeClass("playing");
            $(this).addClass("playing");
        }
    })
    $(".controls").append(
        Player.audio(playList[index]['name'], url)
    );
    myAddListener();
    $(".play").fadeOut("fast", function() {
        $(".pause").fadeIn("fast");
    });
    $(".audio").trigger("play");
    SetVolume(currentVolume);
}

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

    // Hours, minutes and seconds
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

function updateTrackInfo() {
    name = playList[index]['name'];
    artist = playList[index]['artist'];
    album = playList[index]['album'];
    artwork = "/SpotiFree/files/music/"+artist+"/"+album+"/Artwork.png";
    $(".controls .cover-bg").css("background","url('"+artwork+"')");
    $(".playback-artwork").replaceWith("<div class='playback-artwork'><img src='"+artwork+"'></div>")
//                $(".track-info").html("<p><em>"+name+"</em> - "+artist+"</p>");
    $(".playback-title").html("<h1>"+name+"</h1>");
    $(".playback-artist").html("<h2>"+artist+"</h2>");
}

function myNewSrc() {
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

// add a listener function to the ended event
function myAddListener(){
    var audio = document.getElementById("music");
    audio.addEventListener('ended', myNewSrc, false);
}

document.documentElement.addEventListener('touchstart', function (event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, false);

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
            populatePlaylists();
            break;
    }

    if (type) {
        data = {type: type};
        if (!$("."+type+"-item")[0] && !$("#playlist-browser")) {
            getData(data, view);
        }
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

function getData(data, view) {
        request = $.ajax({
            url: "get_metadata.php",
            type: "post",
            data: data
        });

        request.done(function (response){
            meta = JSON.parse(response);
            var text;
            view.empty();
            switch(view.attr("id")) {
                case "artist-browser":
                    text = 'Artists';
                    break;
                case "album-browser":
                    text = 'Albums';
                    break;
                case "playlist-browser":
                    text = 'Playlists';
                    break;
                                  }
            view.append(Player.header(text));
            for (i=0; i<meta.length; i++) {
                if (meta[i]['response'] == "album") {
                    var url = "/SpotiFree/files/music/"+meta[i]['artist']+"/"+meta[i]['album']+"/Artwork.png";
                    view.append("<div class='album-item' name='"+meta[i]['album']+"'><img  src='"+url+"'><p>"+meta[i]['album']+"</p></div>");
                } else if (meta[i]['response'] == "artist") {
                    view.append("<div class='artist-item'>"+meta[i]['artist']+"</div>");
                } else if (meta[i]['response'] == "song") {
                    var url = "/SpotiFree/files/music/"+meta[i]['artist']+"/"+meta[i]['album']+"/Artwork.png";
                    view.append(`
                        <div class="song-item">
                            <img class="artwork" src="${url}">
                            <div id="${i}" value=${meta[i]['url']} name="${i}">
                                <p>${meta[i]['name']}</p>
                                <p>${meta[i]['artist']} &bull; ${meta[i]['album']}</p>
                            </div>
                            <div class="add hi" value="${meta[i]['url']}">
                                <img src="/SpotiFree/files/images/playlist_add.png">
                            </div>
                        </div>
                    `);
//                                <img class='artwork' src='"+url+"'><div  id='"+i+"' value='"+meta[i]['link']+"' name='"+i+"'><p>"+meta[i]['name']+"</p><p>"+meta[i]['artist']+" &bull; "+meta[i]['album']+"</p><p class='track'>"+track+"</p></div><div class='add' value='"+meta[i]['url']+"'><img src='/SpotiFree/files/images/plus.png'></div></div>
                }
            }
            $(".album-item").click(function() {
                var searchVal = $(this).attr("name");
                $("#album-browser").fadeOut("fast", function() {
                    $(".searchbox").val(searchVal).trigger("submit");
                });
            })
            $(".artist-item").click(function() {
                var searchVal = $(this).text();
                $("#artist-browser").fadeOut("fast", function() {
                    $(".searchbox").val(searchVal).trigger("submit");
                });

            })
        });
    }

$("#submit-playlist").click(function() {
    if (validateForm()) {
        var playlistInfo = [$("#playlist-name").val(), $("#playlist-desc").val()];
        playlists.push(playlistInfo);
        $("#playlist-browser").append("<div class='playlist-item' id='playlist-"+playlistInfo[0]+"' name='"+playlistInfo[0]+"'><p>"+playlistInfo[0]+"</p></div>");
        $("#playlist-"+playlistInfo[0]).trigger("click");
        showPlaylist(playlistInfo[0]);
    }
    else {
        alert("Please fill out all the forms!");
    }

    $(".playlist-item").click(function() {
        showPlaylist($(this).attr("name"));
    })
})

function validateForm() {
    var isValid = true;
    $('.playlist-input').each(function() {
        if ( $(this).val() === '' )
            isValid = false;
    });
    return isValid;
}

function showPlaylist(playlistName) {
    $("#playlist-browser").empty();
    $("#playlist-browser").append("<h1>"+playlistName+"</h1>");
    getPlaylistSongs(playlistName, true, false);
    $(".search-result div").click(function() {
        index = 0;
        playMusic($(this));
    });
    $(".shuffle").click(function() {
        if ($(this).attr("value") == "playlist") {
            playList = getPlaylistSongs($(this).attr("name"), false, false);
            shuffle();
        }
    });
}

function shufflePlaylist(playlist) {
    playList = ViewManager.UpdatePlaylistView(playlist);
    shuffle();
}

function getPlaylistSongs(playlistName, append, mobile) {
    $("#playlist-browser").empty();
    for (i=0; i<playlists.length; i++) {
        if (playlists[i][0] == playlistName) {
            if (!playlists[i][2]) {
                $("#playlist-browser").append("<h3>It's empty in here...</h3><h4>Go find a song and press the '+' icon to the right to add it here.</h4>");
            } else {
                if (append) {
                    $("#playlist-browser").append("<h1 class='header'>"+playlists[i][1]+"</h1><div class='action-button shuffle' value='playlist' name='"+playlistName+"'><p>Shuffle Play</p></div>");

                }
                results = [];
                for (j=2; j<playlists[i].length; j++) {
                    results.push(playlists[i][j][0]);
                    var name = playlists[i][j][0]['name'];
                    if (/^\d.*\s/.test(name)) {
                        name = name.slice(3);
                    }
                    artist = playlists[i][j][0]['artist'];
                    album = playlists[i][j][0]['album'];
                    link = playlists[i][j][0]['url'];
                    track = playlists[i][j][0]['track'];
                    var artwork = "/SpotiFree/files/music/"+playlists[i][j][0]['artist']+"/"+playlists[i][j][0]['album']+"/Artwork.png";

                    if (append) {
                        $("#playlist-browser").append(
                            ListItem.inPlaylist(i, playlistName, artwork, name,
                             artist, album, link, track)
                        );
                    }
                }
            }
            if (append) {
                $(".search-results, #playlist-creator").hide();
                $("#playlist-browser").show();
                $(".nav-button, .playlist").removeClass("selected");
                $("#playlist-"+playlists[i][0]).addClass("selected");
            }
        }
    }
    return results;
}

