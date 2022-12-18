import express from 'express';
import xml from './Utility/XML';

const app = express();
app.set("view engine", "ejs");
app.set('views', '../views')

const eventHandler = new xml();

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
        shared: null
    });
});

app.get("/:id", (req, res) => {
    var events = [];

    eventHandler.events.forEach(event => {
        let eevent: any = event;
        eevent.icon = event.iconURL;
        events.push(eevent);
    });

    if (!events.map(event => event.id).includes(req.params.id)) return res.redirect("/");
    let event = events.find(event => event.id == req.params.id);

    res.render("index", {
        events:
            events.sort((a, b) =>
                a.dates.start.getTime() - b.dates.start.getTime()),
        shared: event
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
})

let port = 9218;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

app.use("/assets", express.static(__dirname + '/../assets'));