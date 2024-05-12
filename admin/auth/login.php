<?php
if ($_SERVER['SERVER_PORT'] == 3001) {
    header("Location: https://hub.conep.one/hub/api/rest/oauth2/auth?client_id=" . json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/oauth.dev.json"), true)["id"] . "&response_type=code&redirect_uri=http://localhost:3001/auth/callback.php&scope=Hub&request_credentials=default&access_type=offline");
} else {
    header("Location: https://hub.conep.one/hub/api/rest/oauth2/auth?client_id=" . json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/oauth.json"), true)["id"] . "&response_type=code&redirect_uri=https://admin.ponycon.info/auth/callback.php&scope=Hub&request_credentials=default&access_type=offline");
}
die();