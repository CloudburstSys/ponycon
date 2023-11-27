import express from 'express';
import { readFileSync, watchFile } from "fs";
import xml from './Utility/XML';
import Configuration from "./Types/Configuration";

const app = express();
app.set("view engine", "ejs");
app.set('views', '../views')

const eventHandler = new xml();

let config: Configuration = JSON.parse(readFileSync("../data/config.json").toString());

watchFile("../data/config.json", () => {
    config = JSON.parse(readFileSync("../data/config.json").toString());
});

app.get("/", (req, res) => {
    var events = [];

    eventHandler.events.forEach(event => {
        let eevent: any = event;
        eevent.icon = event.iconURL;
        events.push(eevent);
    });

    res.render("index", {
        events:
            events.sort((a, b) =>
            a.dates.start.getTime() - b.dates.start.getTime()),
        shared: null,
        config,
        schedule: eventHandler.schedule
    });
});

app.get("/schedule", (req, res) => {
    /*res.render("schedule", {
        schedule: eventHandler.schedule
    });*/
    res.status(404).send("Nothing's here... for now...");
});

app.get("/pt-qr", (req, res) => {
    if (config.scheduleQr == null) {
        return res.status(404).send("There is no ongoing Pony Town event.");
    }

    res.redirect(config.scheduleQr);
});

app.get("/:id", (req, res) => {
    var events = [];

    eventHandler.events.forEach(event => {
        let eevent: any = event;
        eevent.icon = event.iconURL;
        events.push(eevent);
    });

    // if (!events.map(event => (event.id, UUIDtoShortID(event.id.split("-")))).includes(req.params.id)) return res.redirect("/");
    let event = events.find(event => [event.id, UUIDtoShortID(event.id)].includes(req.params.id));

    if (event === undefined) return res.redirect("/");

    res.render("index", {
        events:
            events.sort((a, b) =>
                a.dates.start.getTime() - b.dates.start.getTime()),
        shared: event,
        config
    });
});

app.get("/debug/what-the-fuck-is-the-event-data", (req, res) => {
    var events = [];

    eventHandler.events.forEach(event => {
        let eevent: any = event;
        eevent.icon = event.iconURL;
        events.push(eevent);
    });

    res.json(events.sort((a, b) =>
        a.dates.start.getTime() - b.dates.start.getTime()));
});

function UUIDtoShortID(uuid: string) {
    let shortId = [];

    uuid.split("-").forEach(segment => {
        shortId.push(segment[0]);
    });

    return shortId.join("");
}

let port = 9218;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

app.use("/assets", express.static(__dirname + '/../assets'));