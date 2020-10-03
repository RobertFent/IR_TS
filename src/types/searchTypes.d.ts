export interface ISearchQuery {
    id?: string,
    content?: string,
    title?: string,
    'media-type'?: string,
    source?: string,
    published?: string
}

/* interface ISearchBody extends Array<>{
    match: { [key: string]: string }
} */

interface ISearchBody {
    [key: string]: string
}

export interface ISearchBodyArray extends Array<ISearchBody> { }

export interface ISearchResponse<T> {
    took: number;
    timed_out: boolean;
    _scroll_id?: string;
    _shards: IShardsResponse;
    hits: {
        total: number;
        max_score: number;
        hits: Array<{
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source: T;
            _version?: number;
            _explanation?: IExplanation;
            fields?: any;
            highlight?: any;
            inner_hits?: any;
            matched_queries?: string[];
            sort?: string[];
        }>;
    };
    aggregations?: any;
}

interface IExplanation {
    value: number;
    description: string;
    details: Explanation[];
}

interface IShardsResponse {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
}

// Define the interface of the source object
export interface ISource {
    id: string,
    content: string,
    title: string,
    mediaType: string,
    source: string,
    published: string
}

export interface ISourceArray extends Array<ISource> { }

interface ISingleSearchQuery {
    fieldName: string,
    fieldValue: string
}

export interface ISearchQueries extends Array<ISingleSearchQuery> { }
