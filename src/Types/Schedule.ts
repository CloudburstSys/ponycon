export default class Schedule {
    public enabled: boolean;
    public name: string;
    public description: EventLanguages;
    public rooms: ScheduleRoom[] = [];

    constructor(enabled: boolean, name: string, description: EventLanguages, rooms: ScheduleRoom[]) {
        this.enabled = enabled;
        this.name = name;
        this.description = description;
        this.rooms = rooms;
    }

    addRoom(room: ScheduleRoom) {
        this.rooms.push(room);
    }

    addEvent(room: string, event: ScheduleEvent) {
        this.rooms.find(potentialRoom => potentialRoom.name === room).addEvent(event);
    }
}

export class ScheduleRoom {
    public name: string;
    public color: RoomColor
    public events: ScheduleEvent[] = [];

    constructor(name: string, color: RoomColor, events: ScheduleEvent[]) {
        this.name = name;
        this.color = color;
        this.events = events;
    }

    addEvent(event: ScheduleEvent) {
        this.events.push(event);
    }
}

export class RoomColor {
    public red: number;
    public green: number;
    public blue: number;
    public alpha: number;

    constructor(red: number, green: number, blue: number, alpha: number = 1) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    static fromHex(hex: string): RoomColor {
        let hexArray = hex.replace("#", "").split("");

        let red = hexArray.length < 6 ? hexArray[0] + hexArray[0] : hexArray[0] + hexArray[1];
        let green = hexArray.length < 6 ? hexArray[1] + hexArray[1] : hexArray[2] + hexArray[3];
        let blue = hexArray.length < 6 ? hexArray[2] + hexArray[2] : hexArray[4] + hexArray[5];
        let alpha = hexArray.length < 6 ? (hexArray.length == 3 ? "f" : hexArray[3] + hexArray[3]) : (hexArray.length == 6 ? "ff" : hexArray[6] + hexArray[7])

        return new RoomColor(
            parseInt(red, 16),
            parseInt(green, 16),
            parseInt(blue, 16),
            parseInt(alpha, 16) / 255
        )
    }

    toHex(): string {
        return `#${this.red.toString(16)}${this.green.toString(16)}${this.blue.toString(16)}${(this.alpha * 255).toString(16)}`
    }
}

export interface ScheduleEvent {
    start: Date,
    end: Date,
    text: EventLanguages
}

export interface EventLanguages {
    english?: string,
    russian?: string,
    portuguese?: string,
    spanish?: string,
    chinese?: string,
    japanese?: string,
    vietnamese?: string
}