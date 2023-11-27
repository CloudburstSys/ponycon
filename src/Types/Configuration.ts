export default interface Configuration {
    ponytownBanner: PonyTownConfiguration,
    scheduleQr: string | null
}

export interface PonyTownConfiguration {
    show: boolean,
    server: PonyTownConfigurationServer,
    schedule: string | null
}

export enum PonyTownConfigurationServer {
    None = "none",
    Event = "event",
    EventBlue = "eventblue",
    EventGreen = "eventgreen"
}