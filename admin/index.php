<?php require_once $_SERVER['DOCUMENT_ROOT'] . "/private/session.php"; global $list; ?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Admin portal</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body>
    <?php if (isset($_GET["i"]) || isset($_GET["n"])): ?>
    <?php

    $event = null;

    if (isset($_GET["i"])) {
        if (in_array($_GET["i"], array_keys($list))) {
            $event = $list[$_GET["i"]];
        } else {
            die("Not found, <a href='/'>home</a>.</body></html>");
        }
    }

    ?>
    <div class="container">
        <br>
        <h1><?= isset($_GET["i"]) ? $event["name"] : "Create new" ?> <a href="/" class="btn btn-outline-primary" style="float: right;">Home</a></h1>

        <form action="/update.php" method="post">
            <input type="hidden" name="id" required value="<?= $_GET["i"] ?? "" ?>">
            <input type="hidden" name="logo" id="logo-value" required value="">

            <table style="width: 100%;">
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Type:
                        </div>
                    </td>
                    <td>
                        <select name="type" class="form-select" required>
                            <option value="convention" <?= isset($_GET["i"]) ? ($event["type"] === "convention" ? "selected" : "") : "" ?>>Convention</option>
                            <option value="concert" <?= isset($_GET["i"]) ? ($event["type"] === "concert" ? "selected" : "") : "" ?>>Concert</option>
                            <option value="album" <?= isset($_GET["i"]) ? ($event["type"] === "album" ? "selected" : "") : "" ?>>Album release</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Name:
                        </div>
                    </td>
                    <td>
                        <input class="form-control" name="name" required type="text" placeholder="Name" value="<?= isset($_GET["i"]) ? $event["name"] : "" ?>">
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Location:
                        </div>
                    </td>
                    <td>
                        <input class="form-control" name="location" id="location" type="text" placeholder="Location" value="<?= isset($_GET["i"]) && isset($event["location"]) ? $event["location"]["name"] : "" ?>">
                        <input name="location_url" id="location-url" type="hidden" value="<?= isset($_GET["i"]) && isset($event["location"]) ? $event["location"]["url"] : "" ?>">
                        <br>
                        <p><b>Detected:</b> <span id="map-detected">-</span> (<code id="map-detected-id">-</code>)</p>
                        <iframe style="border: 1px solid black;" id="map" src="https://www.openstreetmap.org/export/embed.html"></iframe>
                        <!-- ?bbox=1.8757578%2C47.8132802%2C1.9487114%2C47.9335581 [2, 0, 1, 3] -->
                        <script>
                            document.getElementById("location").addEventListener("change", refreshMap)

                            async function refreshMap() {
                                try {
                                    let data = await (await fetch("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(document.getElementById("location").value) + "&format=json")).json();
                                    console.log(data, data[0]);
                                    let first = data[0];

                                    document.getElementById("map-detected").innerText = first['display_name'];
                                    document.getElementById("map-detected-id").innerText = first['osm_id'];
                                    document.getElementById("location-url").value = "https://openstreetmap.org/" + first['osm_type'] + "/" + first['osm_id'];

                                    console.log(first['boundingbox'][2] + "," + first['boundingbox'][0] + "," + first['boundingbox'][3] + "," + first['boundingbox'][1]);
                                    
                                    document.getElementById("map").src = "https://www.openstreetmap.org/export/embed.html?bbox=" + encodeURIComponent(first['boundingbox'][2] + "," + first['boundingbox'][0] + "," + first['boundingbox'][3] + "," + first['boundingbox'][1])
                                } catch (e) {
                                    document.getElementById("map-detected").innerText = "-";
                                    document.getElementById("map").src = "https://www.openstreetmap.org/export/embed.html";
                                }
                            }

                            if (document.getElementById("location").value.trim() !== "") {
                                refreshMap();
                            }
                        </script>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Summary:
                        </div>
                    </td>
                    <td>
                        <textarea class="form-control" name="summary" placeholder="Summary"><?= isset($_GET["i"]) ? $event["summary"] : "" ?></textarea>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Logo:
                        </div>
                    </td>
                    <td>
                        <input type="file" id="logo" onchange="updateLogo();"><br>
                        <img id="logo-preview" style="border: 1px solid black; height: 96px; max-width: 100%; margin-top: 20px;">
                        <script>
                            let defaultLogo = "<?= isset($_GET['i']) && file_exists($_SERVER['DOCUMENT_ROOT'] . "/../assets/events/" . $_GET['i'] . ".png") ? "https://ponycon.info/assets/events/" . $_GET['i'] . ".png" : "https://ponycon.info/assets/img/placeholder.png" ?>";

                            function updateLogo() {
                                if (!document.getElementById("logo").files[0]) {
                                    document.getElementById("logo-preview").src = defaultLogo;
                                    return
                                }

                                let fr = new FileReader();
                                fr.readAsDataURL(document.getElementById("logo").files[0]);

                                fr.addEventListener("load", function () {
                                    let file = {
                                        type: document.getElementById("logo").files[0].type,
                                        data: this.result.split(",")[1]
                                    }

                                    document.getElementById("logo-preview").src = this.result;
                                    document.getElementById("logo-value").value = JSON.stringify(file);
                                });
                            }

                            document.getElementById("logo").value = "";
                            document.getElementById("logo-preview").src = defaultLogo;
                        </script>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Access:
                        </div>
                    </td>
                    <td>
                        <label>
                            <input type="checkbox" class="form-check-input" name="irl" <?= isset($_GET["i"]) && $event["irl"] ? "checked" : "" ?>>
                            IRL
                        </label>
                        <label>
                            <input type="checkbox" class="form-check-input" name="online" <?= isset($_GET["i"]) && $event["online"] ? "checked" : "" ?>>
                            Online
                        </label>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Dates:
                        </div>
                    </td>
                    <td>
                        <p>
                            <label>
                                Start:
                                <input class="form-control" type="datetime-local" name="date[start]" id="date1" required value="<?= isset($_GET["i"]) ? substr(date("c", $event["date"]["start"]), 0, 16) : "" ?>">
                            </label>
                            <label>
                                End:
                                <input class="form-control" type="datetime-local" name="date[end]" id="date2" required value="<?= isset($_GET["i"]) ? substr(date("c", $event["date"]["end"]), 0, 16) : "" ?>">
                            </label>
                        </p>
                        Starts <span id="time-start">-</span>, for <span id="time-duration">-</span>
                        <script>
                            function timeAgo(time) {
                                if (!isNaN(parseInt(time))) {
                                    time = new Date(time).getTime();
                                }

                                let periods = ["second", "minute", "hour", "day", "week", "month", "year", "ages"];

                                let lengths = ["60", "60", "24", "7", "4.35", "12", "100"];

                                let now = new Date().getTime();

                                let difference = Math.abs(Math.round((now - time) / 1000));
                                let period;

                                if (difference <= 10 && difference >= 0) {
                                    return "now";
                                }

                                let j;

                                for (j = 0; difference >= lengths[j] && j < lengths.length - 1; j++) {
                                    difference /= lengths[j];
                                }

                                difference = Math.round(difference);

                                period = periods[j];

                                return `in ${difference} ${period}${difference > 1 ? "s" : ""}`;
                            }

                            function duration(start, end) {
                                if (!isNaN(parseInt(start))) {
                                    start = new Date(start).getTime();
                                }

                                if (!isNaN(parseInt(end))) {
                                    end = new Date(end).getTime();
                                }

                                let periods = ["second", "minute", "hour", "day", "week", "month", "year", "ages"];

                                let lengths = ["60", "60", "24", "7", "4.35", "12", "100"];

                                let difference = Math.abs(Math.round((end - start) / 1000));
                                let period;

                                if (difference <= 10 && difference >= 0) {
                                    return "-";
                                }

                                let j;

                                for (j = 0; difference >= lengths[j] && j < lengths.length - 1; j++) {
                                    difference /= lengths[j];
                                }

                                difference = Math.round(difference);

                                period = periods[j];

                                return `${difference} ${period}${difference > 1 ? "s" : ""}`;
                            }

                            function updateDate() {
                                if (document.getElementById("date1").value === "" || document.getElementById("date2").value === "") {
                                    document.getElementById("time-start").innerText = "";
                                    document.getElementById("time-duration").innerText = "";
                                    return
                                }

                                document.getElementById("time-start").innerText = timeAgo(new Date(document.getElementById("date1").value));
                                document.getElementById("time-duration").innerText = duration(new Date(document.getElementById("date2").value), new Date(document.getElementById("date1").value));
                            }

                            document.getElementById("date1").onchange = document.getElementById("date2").onchange = updateDate;
                            updateDate();
                        </script>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Website:
                        </div>
                    </td>
                    <td>
                        <input class="form-control" type="url" name="website" placeholder="Website" value="<?= isset($_GET["i"]) ? $event["website"] : "" ?>">
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Pony Town server:
                        </div>
                    </td>
                    <td>
                        <select name="ponytown" required class="form-select">
                            <option value="none" <?= isset($_GET["i"]) ? (isset($event["ponytown"]) ? "" : "selected") : "" ?>>[None]</option>
                            <option value="event" <?= isset($_GET["i"]) ? (isset($event["ponytown"]) && $event["ponytown"] === "main" ? "selected" : "") : "" ?>>event.pony.town</option>
                            <option value="blue" <?= isset($_GET["i"]) ? (isset($event["ponytown"]) && $event["ponytown"] === "blue" ? "selected" : "") : "" ?>>eventblue.pony.town</option>
                            <option value="green" <?= isset($_GET["i"]) ? (isset($event["ponytown"]) && $event["ponytown"] === "green" ? "selected" : "") : "" ?>>eventgreen.pony.town</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><hr></td>
                </tr>
                <tr>
                    <td style="width: 15%; font-weight: bold; text-align: right; padding-right: 10px;">
                        <div style="height: 100%; display: flex; align-items: center; justify-content: right;">
                            Social media:
                        </div>
                    </td>
                    <td>
                        <table style="width:100%;">
                            <tr>
                                <td style="text-align: right; padding-right: 10px; width: 15%;">Discord:</td>
                                <td><input class="form-control" type="text" name="socials[discord]" value="<?= isset($_GET["i"]) ? ($event["socials"]["discord"] ?? "") : "" ?>"></td>
                            </tr>
                            <tr>
                                <td style="text-align: right; padding-right: 10px; width: 15%;">Mastodon:</td>
                                <td><input class="form-control" type="text" name="socials[mastodon]" value="<?= isset($_GET["i"]) ? ($event["socials"]["mastodon"] ?? "") : "" ?>"></td>
                            </tr>
                            <tr>
                                <td style="text-align: right; padding-right: 10px; width: 15%;">Twitter:</td>
                                <td><input class="form-control" type="text" name="socials[twitter]" value="<?= isset($_GET["i"]) ? ($event["socials"]["twitter"] ?? "") : "" ?>"></td>
                            </tr>
                            <tr>
                                <td style="text-align: right; padding-right: 10px; width: 15%;">YouTube:</td>
                                <td><input class="form-control" type="text" name="socials[youtube]" value="<?= isset($_GET["i"]) ? ($event["socials"]["youtube"] ?? "") : "" ?>"></td>
                            </tr>
                            <tr>
                                <td style="text-align: right; padding-right: 10px; width: 15%;">Instagram:</td>
                                <td><input class="form-control" type="text" name="socials[instagram]" value="<?= isset($_GET["i"]) ? ($event["socials"]["instagram"] ?? "") : "" ?>"></td>
                            </tr>
                            <tr>
                                <td style="text-align: right; padding-right: 10px; width: 15%;">Facebook:</td>
                                <td><input class="form-control" type="text" name="socials[facebook]" value="<?= isset($_GET["i"]) ? ($event["socials"]["facebook"] ?? "") : "" ?>"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <br>
            <p style="text-align: center;">
                <label>
                    <input type="checkbox" class="form-check-input" name="_delete" <?= !isset($_GET["i"]) ? "disabled" : "" ?>>
                    Delete
                </label>
                <span style="margin-left: 5px; padding-left: 10px; border-left: 1px solid rgba(0, 0, 0, .25);">
                    <input type="submit" value="Update" class="btn btn-primary">
                </span>
            </p>
        </form>
    </div>
    <?php else: ?>
    <div class="container">
        <br>
        <h1>Admin portal</h1>

        <div class="list-group">
            <?php $olist = $list; uasort($olist, function ($a, $b) {
                return $a["date"]["start"] - $b["date"]["start"];
            }); foreach ($olist as $id => $item): ?>
                <a class="list-group-item list-group-item-action" href="/?i=<?= $id ?>"><?= $item["name"] ?></a>
            <?php endforeach; ?>
        </div>

        <br>
        <a href="/?n" class="btn btn-primary">Create new</a>
    </div>
    <?php endif; ?>
</body>
</html>