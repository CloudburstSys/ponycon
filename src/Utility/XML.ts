import {readFileSync, writeFileSync, watchFile} from "fs";
import xml from "xml-js";
import Event, {EventBreak, EventEnvironment, EventPonytown, EventType} from "../Types/Event";
import Schedule, {RoomColor, ScheduleEvent, ScheduleRoom} from "../Types/Schedule";

export default class XML {
    private supportedSocials: string[] = [
        "discord",
        "mastodon",
        "twitter",
        "youtube",
        "twitch",
        "facebook"
    ];

    private ponytownEventServers = {
        main: EventPonytown.Main,
        green: EventPonytown.Green,
        blue: EventPonytown.Blue
    }

    public events: Event[];
    public schedule: Schedule;
    public rawEventData: any;
    public rawScheduleData: any;

    constructor() {
        this._parseEvents();
        this._parseSchedule();
        this._removeOldEvents();

        watchFile("../data/events.xml", (current, previous) => {
            this._parseEvents();
        });

        watchFile("../data/schedule.xml", (current, previous) => {
            this._parseSchedule();
        });

        setInterval(() => {
            this._removeOldEvents();
        }, (60 * 60 * 1000));
    }

    _removeOldEvents() {
        let newEvents: Event[] = [];

        this.events.forEach(event => {
            if (Date.parse(event.dates.end.toUTCString()) + (24 * 60 * 60 * 1000) > Date.now()) {
                // The event is not over yet.
                newEvents.push(event);
            } else {
                // Needs removing!

                this.rawEventData.elements[0].elements.splice(
                    this.rawEventData.elements[0].elements.findIndex(element => {
                        if (element.name !== "event") return false;
                        if (element.attributes === undefined) return false;

                        return element.attributes.id === event.id;
                    }), 1
                );
            }
        });

        //this.events = newEvents;
        let xmlString = xml.json2xml(JSON.stringify(this.rawEventData, null, 4), { compact: false, spaces: 4 });
        writeFileSync("../data/events.xml", xmlString);
    }

    _parseEvents() {
        this.events = [];
        
        let xmlString = readFileSync("../data/events.xml").toString();

        let xmlData = JSON.parse(xml.xml2json(xmlString, {compact: false}));

        this.rawEventData = xmlData;

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

                            switch(element3.name) {
                                case "name":
                                    if (element3.elements[0].text === undefined) return;
                                    event.location.name = element3.elements[0].text.trim();
                                    break;
                                case "openstreetmap":
                                    event.location.openstreetmap = {
                                        name: null,
                                        url: null
                                    }
                                    element3.elements.forEach(element4 => {
                                        if (element4.elements === undefined) return;
                                        if (element4.elements[0].text === undefined) return;

                                        switch(element4.name) {
                                            case "url":
                                                event.location.openstreetmap.url = element4.elements[0].text.trim();
                                                break;
                                            case "name":
                                                event.location.openstreetmap.name = element4.elements[0].text.trim();
                                                break;
                                            default:
                                                return;
                                        }
                                    });
                                    break;
                                case "googlemaps":
                                    event.location.googlemaps = {
                                        name: null,
                                        url: null
                                    }
                                    element3.elements.forEach(element4 => {
                                        if (element4.elements === undefined) return;
                                        if (element4.elements[0].text === undefined) return;

                                        switch(element4.name) {
                                            case "url":
                                                event.location.googlemaps.url = element4.elements[0].text.trim();
                                                break;
                                            case "name":
                                                event.location.googlemaps.name = element4.elements[0].text.trim();
                                                break;
                                            default:
                                                return;
                                        }
                                    });
                                    break;
                                case "applemaps":
                                    event.location.applemaps = {
                                        name: null,
                                        url: null
                                    }
                                    element3.elements.forEach(element4 => {
                                        if (element4.elements === undefined) return;
                                        if (element4.elements[0].text === undefined) return;

                                        switch(element4.name) {
                                            case "url":
                                                event.location.applemaps.url = element4.elements[0].text.trim();
                                                break;
                                            case "name":
                                                event.location.applemaps.name = element4.elements[0].text.trim();
                                                break;
                                            default:
                                                return;
                                        }
                                    });
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
                    case "break":
                        // Signifies that the event isn't active, but is still ongoing.
                        // Contains 2 elements: start and end.
                        // There can be multiple breaks.
                        let start: Date = null;
                        let end: Date = null;

                        element2.elements.forEach(breakElement => {
                            if(breakElement.elements === undefined) return;
                            if(breakElement.elements[0].text === undefined) return;

                            switch (breakElement.name) {
                                case "start":
                                    start = new Date(breakElement.elements[0].text.trim());
                                    break;
                                case "end":
                                    end = new Date(breakElement.elements[0].text.trim());
                                    break;
                                default:
                                    return;
                            }
                        });

                        if (start === null || end === null) return;

                        event.breaks.push({
                            start, end
                        });
                        break;
                    case "socials":
                        if (element2.elements === undefined) return;

                        element2.elements.forEach(social => {
                            if (social.elements === undefined) return;

                            if (!this.supportedSocials.includes(social.name)) return;

                            let url: string = null;
                            let live: boolean = null;

                            social.elements.forEach(item => {
                                if (item.elements === undefined) return;
                                if (item.elements[0].text === undefined) return;

                                switch (item.name) {
                                    case "url":
                                        url = item.elements[0].text.trim();
                                        break;
                                    case "live":
                                        live = item.elements[0].text === "true";
                                        break;
                                    default:
                                        return;
                                }
                            });

                            if (url === null || live === null) return;

                            event.socials[social.name] = {
                                url,
                                live
                            };
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

    _parseSchedule() {
        this.schedule = new Schedule(false, "", {}, []);

        let xmlString = readFileSync("../data/schedule.xml").toString();

        let xmlData = JSON.parse(xml.xml2json(xmlString, {compact: false}));

        this.rawScheduleData = xmlData;

        if (xmlData.elements === null) return;
        if (xmlData.elements[0].name !== "schedule") return;
        if (xmlData.elements[0].elements === undefined) return;

        console.log(JSON.stringify(xmlData));

        xmlData.elements[0].elements.forEach(element => {
            switch (element.name) {
                case "enabled":
                    if (element.elements === undefined) return;
                    if (element.elements[0].text === undefined) return;
                    this.schedule.enabled = element.elements[0].text.trim() === "true";
                    break;
                case "name":
                    if (element.elements === undefined) return;
                    if (element.elements[0].text === undefined) return;
                    this.schedule.name = element.elements[0].text.trim();
                    break;
                case "description":
                    if (element.elements === undefined) return;

                    this.schedule.description = {};

                    element.elements.forEach(text => {
                        if (text.elements === undefined) return;
                        if (text.elements[0].text === undefined) return;

                        this.schedule.description[text.name] = text.elements[0].text.trim();
                    });
                    break;
                case "events":
                    // TODO: Schedule processing.
                    if (element.elements === undefined) return;

                    element.elements.forEach(rooms => {
                        if (rooms.elements === undefined) return;
                        if (rooms.name !== "room") return;
                        if (rooms.attributes === undefined) return;
                        if (rooms.attributes.name === undefined) return;
                        if (rooms.attributes.color === undefined) return;

                        let room = new ScheduleRoom(rooms.attributes.name, RoomColor.fromHex(rooms.attributes.color), []);
                        let roomName = room.name;

                        this.schedule.addRoom(room);

                        rooms.elements.forEach(events => {
                            if (events.elements === undefined) return;
                            if (events.name !== "event") return;
                            if (events.attributes === undefined) return;
                            if (events.attributes.start === undefined) return;
                            if (events.attributes.end === undefined) return;

                            let event: ScheduleEvent = {
                                start: new Date(events.attributes.start.trim()),
                                end: new Date(events.attributes.end.trim()),
                                text: {}
                            }

                            events.elements.forEach(text => {
                                if (text.elements === undefined) return;
                                if (text.elements[0].text === undefined) return;

                                event.text[text.name] = text.elements[0].text.trim();
                            });

                            this.schedule.addEvent(roomName, event);
                        });
                    });
            }
        });
    }
}