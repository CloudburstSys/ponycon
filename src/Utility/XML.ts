import {readFileSync, writeFileSync, watchFile} from "fs";
import xml from "xml-js";
import Event, {EventEnvironment, EventPonytown, EventType} from "../Types/Event";

export default class XML {
    private supportedSocials: string[] = [
        "discord",
        "mastodon",
        "twitter",
        "youtube",
        "instagram",
        "facebook"
    ];

    private ponytownEventServers = {
        main: EventPonytown.Main,
        green: EventPonytown.Green,
        blue: EventPonytown.Blue
    }

    public events: Event[];
    public rawData: any;

    constructor() {
        this._parse();
        this._removeOldEvents();

        watchFile("../data/events.xml", (current, previous) => {
            this._parse();
        });

        setInterval(this._removeOldEvents, (60 * 60 * 1000));
    }

    _removeOldEvents() {
        let newEvents: Event[] = [];

        this.events.forEach(event => {
            if (Date.parse(event.dates.end.toUTCString()) + (24 * 60 * 60 * 1000) > Date.now()) {
                // The event is not over yet.
                newEvents.push(event);
            } else {
                // Needs removing!

                this.rawData.elements[0].elements.splice(
                    this.rawData.elements[0].elements.findIndex(element => {
                        if (element.name !== "event") return false;
                        if (element.attributes === undefined) return false;

                        return element.attributes.id === event.id;
                    }), 1
                );
            }
        });

        //this.events = newEvents;
        let xmlString = xml.json2xml(JSON.stringify(this.rawData, null, 4), { compact: false, spaces: 4 });
        writeFileSync("../data/events.xml", xmlString);
    }

    _parse() {
        this.events = [];
        
        let xmlString = readFileSync("../data/events.xml").toString();

        let xmlData = JSON.parse(xml.xml2json(xmlString, {compact: false}));

        this.rawData = xmlData;

        if (xmlData.elements === null) return;
        if (xmlData.elements[0].name !== "events") return;
        if (xmlData.elements[0].elements === undefined) return;

        xmlData.elements[0].elements.forEach(element => {
            if (element.name !== "event") return;
            if (element.attributes === undefined) return;
            if (element.attributes.id === undefined) return;
            if (element.attributes.type === undefined) return;
            if (element.attributes.hidden === "true") return;

            if (element.elements === undefined) return;

            let id = element.attributes.id;
            let type;

            switch (element.attributes.type) {
                case "convention":
                    type = EventType.Convention;
                    break;
                case "concert":
                    type = EventType.Concert;
                    break;
                case "album":
                    type = EventType.AlbumRelease;
                    break;
                default:
                    type = EventType.None;
                    break;
            }

            let event = new Event(id, type);

            element.elements.forEach(element2 => {
                switch (element2.name) {
                    case "name":
                        if (element2.elements === undefined) return;
                        if (element2.elements[0].text === undefined) return;
                        event.name = element2.elements[0].text.trim();
                        break;
                    case "summary":
                        if (element2.elements === undefined) return;
                        if (element2.elements[0].text === undefined) return;
                        event.summary = element2.elements[0].text.trim();
                        break;
                    case "online":
                        if (event.environment === EventEnvironment.IRL) {
                            event.environment = EventEnvironment.Both;
                        } else {
                            event.environment = EventEnvironment.Online;
                        }
                        break;
                    case "irl":
                        if (event.environment === EventEnvironment.Online) {
                            event.environment = EventEnvironment.Both;
                        } else {
                            event.environment = EventEnvironment.IRL;
                        }
                        break;
                    case "location":
                        if (element2.elements === undefined) return;

                        element2.elements.forEach(element3 => {
                            if(element3.elements === undefined) return;
                            if(element3.elements[0].text === undefined) return;

                            switch(element3.name) {
                                case "url":
                                    event.location.url = element3.elements[0].text.trim();
                                    break;
                                case "name":
                                    event.location.name = element3.elements[0].text.trim();
                                    break;
                                default:
                                    return;
                            }
                        });
                        break;
                    case "start":
                        if (element2.elements === undefined) return;
                        if (element2.elements[0].text === undefined) return;
                        event.dates.start = new Date(element2.elements[0].text.trim());
                        break;
                    case "end":
                        if (element2.elements === undefined) return;
                        if (element2.elements[0].text === undefined) return;
                        event.dates.end = new Date(element2.elements[0].text.trim());
                        break;
                    case "socials":
                        if (element2.elements === undefined) return;

                        element2.elements.forEach(social => {
                            if(social.elements === undefined) return;
                            if(social.elements[0].text === undefined) return;

                            if(!this.supportedSocials.includes(social.name)) return;

                            event.socials[social.name] = social.elements[0].text.trim();
                        });

                        break;
                    case "website":
                        if (element2.elements === undefined) return;
                        if (element2.elements[0].text === undefined) return;
                        event.website = element2.elements[0].text.trim();
                        break;
                    case "ponytown":
                        if (element2.attributes === null) return;
                        if (!this.ponytownEventServers.hasOwnProperty(element2.attributes.server)) return;

                        event.ponytown = this.ponytownEventServers[element2.attributes.server];
                        break;
                    default:
                        // just ignore it honestly
                        return;
                }
            });

            this.events.push(event);
        });
    }
}