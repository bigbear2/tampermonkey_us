<?php
//allow CORS request
header('Access-Control-Allow-Origin: *');

if (isset($_GET['msg'])) {
    //you can also log to a file or whatever, I just log to standard logs
    error_log("[CONSOLE.LOG] " . json_decode($_GET['msg'], true));
}