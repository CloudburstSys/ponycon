import { existsSync } from 'fs';

export default class Event {
    public id: string;
    public type: EventType;
    public name: string = null;
    public summary: string = null;
    public environment: EventEnvironment = EventEnvironment.None;
    public location: EventLocation = { name: null, url: null };
    public dates: EventDates = { start: null, end: null };
    public socials: EventSocials = {};
    public website: string = null
    public ponytown: EventPonytown = EventPonytown.None;

    constructor(id: string, type: EventType) {
        this.id = id;
        this.type = type;
    }

    get iconURL() {
        if (existsSync("../assets/events/"+this.id+".png")) return "/assets/events/"+this.id+".png";
        return "/assets/img/placeholder.png";
    }
}

export enum EventType {
    None,
    Convention,
    Concert,
    AlbumRelease
}

export enum EventEnvironment {
    None,
    Online,
    IRL,
    Both
}

export enum EventPonytown {
    None,
    Main,
    Blue,
    Green
}

export interface EventLocation {
    name: string,
    url: string
}

export interface EventDates {
    start: Date,
    end: Date
}

export interface EventSocials {
    discord?: string,
    mastodon?: string,
    twitter?: string,
    youtube?: string,
    instagram?: string,
    facebook?: string
}