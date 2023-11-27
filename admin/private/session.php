<?php

global $isLoggedIn;
global $isUserLoggedIn;
global $_PROFILE;
global $list;

if (isset($_COOKIE['PCIA_SESSION_TOKEN'])) {
    if (str_contains($_COOKIE['PCIA_SESSION_TOKEN'], ".") || str_contains($_COOKIE['PCIA_SESSION_TOKEN'], "/")) {
        $isLoggedIn = false;
    }

    if (file_exists($_SERVER['DOCUMENT_ROOT'] . "/private/tokens/" . str_replace(".", "", str_replace("/", "", $_COOKIE['PCIA_SESSION_TOKEN'])))) {
        $_PROFILE = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/private/tokens/" . str_replace(".", "", str_replace("/", "", $_COOKIE['PCIA_SESSION_TOKEN']))), true);

        $isLoggedIn = true;
    } else {
        $isLoggedIn = false;
    }
} else {
    $isLoggedIn = false;
}

if (!$isLoggedIn) {
    header("Location: /auth/login.php");
}

$eventXml = simplexml_load_string(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/../data/events.xml"), "SimpleXMLElement", LIBXML_NOCDATA);
$scheduleXml = simplexml_load_string(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/../data/schedule.xml"), "SimpleXMLElement", LIBXML_NOCDATA);
$eventJson = json_encode($eventXml);
$scheduleJson = json_encode($scheduleXml);
$eventArray = json_decode($eventJson,true);
$scheduleArray = json_decode($scheduleJson, true);

$list = [];
$schedule = [];

if (isset($eventArray["event"])) {
    if (isset($eventArray["event"]["name"])) {
        $events = [ $eventArray["event"] ];
    } else {
        $events = $eventArray["event"];
    }

    foreach ($events as $event) {
        $list[$event["@attributes"]["id"]] = [
            "hidden" => $event["@attributes"]["hidden"] == "true",
            "type" => $event["@attributes"]["type"],
            "name" => trim($event["name"] ?? "<untitled>"),
            "summary" => trim($event["summary"] ?? "") === "" ? null : trim($event["summary"] ?? ""),
            "location" => isset($event["location"]) ? [
                "name" => trim($event["location"]["name"] ?? "") === "" ? null : trim($event["location"]["name"] ?? ""),
                "openstreetmap" => isset($event["location"]["openstreetmap"]) ? [
                    "name" => trim($event["location"]["openstreetmap"]["name"] ?? "") === "" ? null : trim($event["location"]["openstreetmap"]["name"] ?? ""),
                    "url" => trim($event["location"]["openstreetmap"]["url"] ?? "") === "" ? null : trim($event["location"]["openstreetmap"]["url"] ?? ""),
                ] : null,
                "googlemaps" => isset($event["location"]["googlemaps"]) ? [
                    "name" => trim($event["location"]["googlemaps"]["name"] ?? "") === "" ? null : trim($event["location"]["googlemaps"]["name"] ?? ""),
                    "url" => trim($event["location"]["googlemaps"]["url"] ?? "") === "" ? null : trim($event["location"]["googlemaps"]["url"] ?? ""),
                ] : null,
                "applemaps" => isset($event["location"]["applemaps"]) ? [
                    "name" => trim($event["location"]["applemaps"]["name"] ?? "") === "" ? null : trim($event["location"]["applemaps"]["name"] ?? ""),
                    "url" => trim($event["location"]["applemaps"]["url"] ?? "") === "" ? null : trim($event["location"]["applemaps"]["url"] ?? ""),
                ] : null,
            ] : null,
            "irl" => isset($event["irl"]),
            "online" => isset($event["online"]),
            "website" => isset($event["website"]) ? $event["website"] : null,
            "ponytown" => isset($event["ponytown"]) ? $event["ponytown"]["@attributes"]["server"] : null,
            "date" => [
                "start" => strtotime($event["start"] ?? "0") === 0 ? null : strtotime($event["start"] ?? "0"),
                "end" => strtotime($event["end"] ?? "0") === 0 ? null : strtotime($event["end"] ?? "0"),
            ],
            "break" => [],
            "socials" => []
        ];

        if (isset($event["break"])) {
            if (array_values($event["break"]) === $event["break"]) {
                // Multiple breaks.
                foreach ($event["break"] as $index => $break) {
                    $list[$event["@attributes"]["id"]]["break"][] = [
                        "start" => strtotime($break["start"] ?? "0") === 0 ? null : strtotime($break["start"] ?? "0"),
                        "end" => strtotime($break["end"] ?? "0") === 0 ? null : strtotime($break["end"] ?? "0")
                    ];
                }
            } else {
                // Single break.
                $list[$event["@attributes"]["id"]]["break"][] = [
                    "start" => strtotime($event["break"]["start"] ?? "0") === 0 ? null : strtotime($event["break"]["start"] ?? "0"),
                    "end" => strtotime($event["break"]["end"] ?? "0") === 0 ? null : strtotime($event["break"]["end"] ?? "0")
                ];
            }
        }

        foreach ($event["socials"] as $name => $value) {
            $list[$event["@attributes"]["id"]]["socials"][$name] = [
                "url" => trim($value["url"]),
                "live" => trim($value["live"]) === "true"
            ];
        }
    }
}

function export_event_list() {
    global $list;

    $str = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<events>\n";

    foreach ($list as $id => $event) {
        $str .= "    <event id=\"" . str_replace("\"", "\\\"", $id) . "\" type=\"" . str_replace("\"", "\\\"", $event["type"]) . "\" hidden=\"" . (isset($event["hidden"]) && $event["hidden"] ? "true" : "false") . "\">\n";

        if (isset($event["name"])) $str .= "        <name>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["name"])) . "</name>\n";
        if (isset($event["summary"])) $str .= "        <summary>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["summary"])) . "</summary>\n";

        if (isset($event["irl"]) && $event["irl"]) $str .= "        <irl/>\n";
        if (isset($event["online"]) && $event["online"]) $str .= "        <online/>\n";

        if (isset($event["date"]["start"])) $str .= "        <start>" . date("c", $event["date"]["start"]) . "</start>\n";
        if (isset($event["date"]["end"])) $str .= "        <end>" . date("c", $event["date"]["end"]) . "</end>\n";
        if (isset($event["break"])) {
            if (array_values($event["break"]) === $event["break"]) {
                // multiple
                foreach ($event["break"] as $index => $break) {
                    $str .= "        <break>\n";
                    $str .= "            <start>" . date("c", $break["start"]) . "</start>\n";
                    $str .= "            <end>" . date("c", $break["end"]) . "</end>\n";
                    $str .= "        </break>\n";
                }
            } else {
                // single
                $str .= "        <break>\n";
                $str .= "            <start>" . date("c", $event["break"]["start"]) . "</start>\n";
                $str .= "            <end>" . date("c", $event["break"]["end"]) . "</end>\n";
                $str .= "        </break>\n";
            }
        }
        if (isset($event["location"])) {
            $str .= "        <location>\n";
            $str .= "            <name>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["location"]["name"])) . "</name>\n";

            if (isset($event["location"]["openstreetmap"])) {
                $str .= "            <openstreetmap>\n";
                $str .= "                <name>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["location"]["openstreetmap"]["name"])) . "</name>\n";
                $str .= "                <url>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["location"]["openstreetmap"]["url"])) . "</url>\n";
                $str .= "            </openstreetmap>\n";
            }

            if (isset($event["location"]["googlemaps"])) {
                $str .= "            <googlemaps>\n";
                $str .= "                <name>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["location"]["googlemaps"]["name"])) . "</name>\n";
                $str .= "                <url>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["location"]["googlemaps"]["url"])) . "</url>\n";
                $str .= "            </googlemaps>\n";
            }

            if (isset($event["location"]["applemaps"])) {
                $str .= "            <applemaps>\n";
                $str .= "                <name>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["location"]["applemaps"]["name"])) . "</name>\n";
                $str .= "                <url>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["location"]["applemaps"]["url"])) . "</url>\n";
                $str .= "            </applemaps>\n";
            }

            $str .= "        </location>\n";
        }

        $str .= "        <socials>\n";

        foreach ($event["socials"] as $platform => $social) {
            $str .= "            <" . str_replace("<", "-", str_replace(">", "-", $platform)) . ">\n";
            $str .= "                <url>" . $social["url"] . "</url>\n";
            $str .= "                <live>" . ($social["live"] ? "true" : "false") . "</live>\n";
            $str .= "            </" . str_replace("<", "-", str_replace(">", "-", $platform)) . ">\n";
        }

        $str .= "        </socials>\n";

        if (isset($event["website"])) $str .= "        <website>" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["website"])) . "</website>\n";
        if (isset($event["ponytown"])) $str .= "        <ponytown server=\"" . str_replace("<", "&lt;", str_replace(">", "&gt;", $event["ponytown"])) . "\"/>\n";

        $str .= "    </event>\n";
    }

    $str .= "</events>";

    return $str;
}
