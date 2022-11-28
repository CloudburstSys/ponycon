<?php

function uuidv4($data) {
    assert(strlen($data) == 16);

    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

require_once $_SERVER['DOCUMENT_ROOT'] . "/private/session.php"; global $list;

$data = $_POST;
$id = $data["id"];
$logo = json_decode($data["logo"] ?? "null", true) ?? null;

unset($data["id"]);
unset($data["logo"]);

if ($id === "") $id = uuidv4(openssl_random_pseudo_bytes(16));

$socials = [];
foreach ($data["socials"] as $name => $social) {
    if (trim($social) !== "") {
        $socials[$name] = $social;
    }
}
$data["socials"] = $socials;

$data["date"]["start"] = strtotime($data["date"]["start"] . ":00+00:00");
$data["date"]["end"] = strtotime($data["date"]["end"] . ":00+00:00");

if ($data["ponytown"] === "none") unset($data["ponytown"]);
if (trim($data["website"]) === "") unset($data["website"]);
if (trim($data["summary"]) === "") unset($data["summary"]);

if (trim($data["location"]) === "") {
    unset($data["location"]);
} else {
    $data["location"] = [
        "name" => $data["location"],
        "url" => $data["location_url"] ?? null
    ];
}

if (in_array($id, array_keys($list))) unset($list[$id]);
if (!isset($data["_delete"])) $list[$id] = $data;

if (isset($logo)) {
    if (str_starts_with($logo["type"], "image/")) {
        file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/../assets/events/" . $id . ".png", base64_decode($logo["data"]));
    }
}

file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/../data/events.bak", file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/../data/events.xml"));
file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/../data/events.xml", export_list());

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
    <title>Admin portal</title>
</head>
<body>
    <div class="container">
        <br>
        <p>The operation completed successfully.</p>
        <a class="btn btn-primary" href="/">Home</a>
    </div>
</body>
</html>
