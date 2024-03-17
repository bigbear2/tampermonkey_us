<?php
$url = strval($_GET['url']);
if ($url == "") $url = "http://vjs.zencdn.net/v/oceans.mp4";
$type = "mp4";
$type = (strpos($url, ".webm") !== false) ? "webm" : $type;
$source = "<source src='{$url}' type='video/{$type}'>"
?>
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Title</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!--    <link href="http://vjs.zencdn.net/4.12/video-js.css" rel="stylesheet">
        <script src="http://vjs.zencdn.net/4.12/video.js"></script>-->
    <style>
        .rotate {
            transform: rotate(90deg) translateY(-100%);
            transform-origin: top left;
        }

        #video-player {
            position: absolute;
            z-index: -1;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        body {
            margin: 0;
            overflow: hidden;
        }
    </style>

</head>
<body>

<div class="card text-center" id="video-player-card">
    <div class="card-body p0" id="video-player-body">
        <video id="video-player" class="video-js vjs-default-skin" preload="auto"
               data-setup='{ "inactivityTimeout": 0 }'>
            <?= $source ?>
        </video>
    </div>
    <div class="card-footer text-body-secondary" id="video-controls">
        <div class="container">
            <div class="row">
                <div class="col-1">

                </div>
                <div class="col-1"></div>
                <div class="col-1"></div>
                <div class="col-1"></div>
                <div class="col-1"></div>
                <div class="col-1">
                    <button type="button" class="btn btn-warning" id="vp-play"><i class="bi bi-play-fill"></i></button>
                </div>

                <div class="col-1"></div>
                <div class="col-1"></div>
                <div class="col-1"></div>
                <div class="col-1">
                    <button type="button" class="btn btn-outline-primary vp-skip" data-value="5"><i
                                class="bi bi-fast-forward"></i></button>
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-outline-primary vp-skip" data-value="25"><i
                                class="bi bi-fast-forward-fill"></i></button>
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-outline-primary vp-skip" data-value="60"><i
                                class="bi bi-skip-forward-fill"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js"
        integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy"
        crossorigin="anonymous"></script>
<script>
    const is_horizontal = (window.visualViewport.width > window.visualViewport.height);

    const isShow = (element) => {
        let result = ($(element).css('display') == 'none' || $(element).css("visibility") == "hidden");
        return !result;
    }

    const $$$ = (value, all = false) => {
        if (all) {
            return document.querySelectorAll(value)
        } else {
            return document.querySelector(value)
        }
    };

    function addListenerMulti(element, events, callback) {
        events.split(' ').forEach(e => element.addEventListener(e, callback, true));
    }

    function rotateVideo() {
        let card = document.querySelector("#video-player-card");
        if (!is_horizontal) {
            card.classList.add("rotate");
            card.style.width = window.visualViewport.height + "px"
            card.style.height = window.visualViewport.width + "px"
        } else {
            card.style.height = window.visualViewport.height + "px"
            card.style.width = window.visualViewport.width + "px"
        }
    }


    const video_player = {
        element: $$$("#video-player"),
        player: ($$$("#video-player")),
        isPlaying: false,

        init: () => {
            video_player.video_events_init();

            $("#vp-play").on("click", video_player.play);
            $(".vp-skip").on("click", video_player.skip);


            $("#video-player-body").on('click', function () {
                $("#video-controls").toggle(500);
            });

            $("video").on('click', function () {
                $("#video-controls").toggle(500);
            });

        },
        play: (evt) => {
            let button = document.querySelector("#vp-play");
            if (video_player.isPlaying) {
                button.innerHTML = '<i class="bi bi-play-fill"></i>';
                video_player.player.pause();

            } else {
                button.innerHTML = '<i class="bi bi-pause-fill"></i>';
                video_player.player.play();
                $("#video-controls").hide(500);
            }

        },
        skip: (evt) => {
            let elm = evt.currentTarget;
            let value = $(elm).attr("data-value");
            console.debug("skip", value);
            video_player.player.currentTime += parseInt(value);
        },
        parse_event: (event) => {
            let video = event.target;
            let type = event.type;
            console.log(type);

            switch (type) {
                case "loadstart":
                    break;
                case "durationchange":
                    break;
                case "loadedmetadata":
                    break;
                case "loadeddata":
                    break;
                case "progress":
                    break;
                case "canplay":
                    /*document.module_video.set_actual_video(video);*/
                    break;
                case "canplaythrough":
                    /*document.module_video.set_actual_video(video);*/
                    break;
                case "playing":
                    video_player.isPlaying = true;
                    break;
                case "play":

                    /*document.module_video.video_info.play = true;
                    document.module_video.set_actual_video(video);*/
                    break;
                case "pause":
                    video_player.isPlaying = false;
                    /*document.module_video.video_info.play = false;
                    document.module_video.set_actual_video(video);*/
                    break;
                case "timeupdate":
                    /*document.module_video.get_video_info();
                    document.module_video.set_video_info();*/
                    break;
                default:
                    return;
            }


        },
        video_events_init: () => {
            document.addEventListener("playing", video_player.parse_event, {capture: true, once: true});
            document.addEventListener("playing", video_player.parse_event, {capture: true});
            document.addEventListener("play", video_player.parse_event, true);
            document.addEventListener("pause", video_player.parse_event, true);
            document.addEventListener("timeupdate", video_player.parse_event, true);
            document.addEventListener("loadstart", video_player.parse_event, true);
            document.addEventListener("durationchange", video_player.parse_event, true);
            document.addEventListener("loadedmetadata", video_player.parse_event, true);
            document.addEventListener("loadeddata", video_player.parse_event, true);
            document.addEventListener("progress", video_player.parse_event, true);
            document.addEventListener("canplay", video_player.parse_event, true);
            document.addEventListener("canplaythrough", video_player.parse_event, true);
        }
    }


    window.onload = function (evt) {
        setTimeout(function () {
            rotateVideo()
        }, 200);
        video_player.init();
    };

</script>
</body>
</html>
