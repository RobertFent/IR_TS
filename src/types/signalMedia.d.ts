export interface ISignalMedia {
    [index: number]: ISginalMediaEntry
}

export interface ISignalMediaArray extends Array<ISginalMediaEntry>{}

export interface ISginalMediaEntry {
    id: string,
    content: string,
    title: string,
    mediaType: string,
    source: string,
    published: string
}
