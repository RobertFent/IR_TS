export interface ISignalMedia {
    [index: number]: ISignalMediaEntry
}

export interface ISignalMediaArray extends Array<ISignalMediaEntry>{}

export interface ISignalMediaEntry {
    id: string,
    content: string,
    title: string,
    mediaType: string,
    source: string,
    published: string
}
