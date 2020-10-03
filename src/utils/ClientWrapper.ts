/* eslint-disable no-unused-vars */
import { Client } from '@elastic/elasticsearch';
import { ISearchBody, ISearchQueries, ISearchQuery, ISearchResponse, ISource } from '../types/searchTypes';
import { ISignalMediaArray } from '../types/signalMedia';
import Logger from './Logger';

export default class ClientWrapper {

    private client: Client;
    private logger: Logger;
    public index: string;

    constructor(index: string) {
        this.client = new Client({ node: 'http://localhost:9200' });
        this.logger = new Logger(this.constructor.name);
        this.index = index;
    }

    // fuck typing
    public createIndex = async (similarity: any, analyzer: any): Promise<void> => {
        this.logger.info('Creating index: ' + this.index);
        const result = await this.client.indices.create({
            index: this.index,
            body: {
                settings: {
                    analysis: analyzer,
                    // default idf
                    index: similarity
                },
                mappings: {
                    properties: {
                        id: { type: 'text' },
                        source: {
                            type: 'text',
                            analyzer: 'my_custom_analyzer',
                            similarity: 'my_similarity'
                        },
                        published: { 'type': 'text' },
                        title: {
                            type: 'text',
                            analyzer: 'my_custom_analyzer',
                            similarity: 'my_similarity'
                        },
                        'media-type': {
                            type: 'text',
                            analyzer: 'my_custom_analyzer',
                            similarity: 'my_similarity'
                        },
                        content: {
                            type: 'text',
                            analyzer: 'my_custom_analyzer',
                            similarity: 'my_similarity'
                        }
                    }
                }
            }
        });
        this.logger.info('Index creation response: ', result);
    }

    /*
    at least it worked?
    2020-09-20 06:37:58 | INFO | Server | Currently parsed entries: 100000
    2020-09-20 06:37:58 | INFO | Server | Indexing documents...
    2020-09-20 06:37:58 | DEBUG | ClientWrapper | test
    2020-09-20 06:39:26 | DEBUG | ClientWrapper | Bulk request:  | data: {"total":769919,"failed":0,"retry":0,"successful":769919,"time":88645,"bytes":2100848247,"aborted":false} |
    <--- Last few GCs --->
    [3673:0x477e6b0]   109279 ms: Mark-sweep (reduce) 4093.5 (4104.6) -> 4092.9 (4104.9) MB, 502.7 / 0.0 ms  (average mu = 0.065, current mu = 0.003) task scavenge might not succeed
    [3673:0x477e6b0]   109700 ms: Mark-sweep (reduce) 4093.7 (4101.9) -> 4093.0 (4102.6) MB, 419.4 / 0.0 ms  (average mu = 0.033, current mu = 0.004) task scavenge might not succeed
    <--- JS stacktrace --->
    FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
    */
    public indexDocuments = async (entries: ISignalMediaArray): Promise<void> => {

        this.logger.info('Indexing documents at index: ' + this.index);
        const that = this;
        const result = await this.client.helpers.bulk({
            datasource: entries,
            onDocument(_doc) {
                return {
                    index: { _index: that.index as string }
                };
            }
        });

        this.logger.info('Bulk request response: ', result);
    }

    // AND matching
    public getSearchResultsByQuery = async (searchBody: ISearchBody | any): Promise<ISearchResponse<ISource>> => {
        // const query = JSON.stringify(searchBody).replace(/"/g, '').replace(/\\/g, '');
        const query = { ...searchBody };
        const body = {
            body: { query }
        };
        try {
            const response = await this.client.search<ISearchResponse<ISource>>({
                index: this.index,
                body: {
                    query: {
                        bool: {
                            must: {
                                searchBody
                            }
                        }
                    }
                }
            });
            return response.body;
        } catch (error) {
            this.logger.error(error);
        }
        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: JSON.stringify(searchBody)
            }
        });
        return response.body;
    }

    // FUCK GENERIC
    public getSearchResultsBySingleParam = async (searchQuery: ISearchQueries): Promise<ISearchResponse<ISource>> => {
        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: {
                    match: { [searchQuery[0].fieldName]: searchQuery[0].fieldValue }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return response.body;
    }

    public getSearchResultsByDoubleParam = async (searchQueries: ISearchQueries): Promise<ISearchResponse<ISource>> => {
        const builtBody: any = [];
        searchQueries.forEach((value) => { builtBody.push({ match: { [value.fieldName]: value.fieldValue } }); });
        /* const body = {
            query: {
                bool: {
                    must: [
                        builtBody[0],
                        builtBody[1]
                        // { match: { [searchQueries[0].fieldName]: searchQueries[0].fieldValue } },
                        // { match: { [searchQueries[1].fieldName]: searchQueries[1].fieldName } }
                    ]
                }
            }
        }; */
        const response = await this.client.search<ISearchResponse<ISource>>({
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { [searchQueries[0].fieldName]: searchQueries[0].fieldValue } },
                            { match: { [searchQueries[1].fieldName]: searchQueries[1].fieldName } }
                        ]
                    }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return response.body;
        // return JSON.stringify(response.body.hits);
    }

    public getSearchResultsByTripleParam = async (searchQueries: ISearchQueries): Promise<ISearchResponse<ISource>> => {
        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { [searchQueries[0].fieldName]: searchQueries[0].fieldValue } },
                            { match: { [searchQueries[1].fieldName]: searchQueries[1].fieldName } },
                            { match: { [searchQueries[2].fieldName]: searchQueries[2].fieldValue } }
                        ]
                    }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return response.body;
    }

    public getSearchResultsByFourParams = async (searchQueries: ISearchQueries): Promise<ISearchResponse<ISource>> => {
        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { [searchQueries[0].fieldName]: searchQueries[0].fieldValue } },
                            { match: { [searchQueries[1].fieldName]: searchQueries[1].fieldName } },
                            { match: { [searchQueries[2].fieldName]: searchQueries[2].fieldValue } },
                            { match: { [searchQueries[3].fieldName]: searchQueries[3].fieldValue } }
                        ]
                    }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return response.body;
    }

    public getSearchResultsByFiveParams = async (searchQueries: ISearchQueries): Promise<ISearchResponse<ISource>> => {
        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { [searchQueries[0].fieldName]: searchQueries[0].fieldValue } },
                            { match: { [searchQueries[1].fieldName]: searchQueries[1].fieldName } },
                            { match: { [searchQueries[2].fieldName]: searchQueries[2].fieldValue } },
                            { match: { [searchQueries[3].fieldName]: searchQueries[3].fieldValue } },
                            { match: { [searchQueries[4].fieldName]: searchQueries[4].fieldName } }
                        ]
                    }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return response.body;
    }

    public getSearchResultsBySixParams = async (searchQueries: ISearchQueries): Promise<ISearchResponse<ISource>> => {
        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: {
                    bool: {
                        must: [
                            { match: { [searchQueries[0].fieldName]: searchQueries[0].fieldValue } },
                            { match: { [searchQueries[1].fieldName]: searchQueries[1].fieldName } },
                            { match: { [searchQueries[2].fieldName]: searchQueries[2].fieldValue } },
                            { match: { [searchQueries[3].fieldName]: searchQueries[3].fieldValue } },
                            { match: { [searchQueries[4].fieldName]: searchQueries[4].fieldName } },
                            { match: { [searchQueries[5].fieldName]: searchQueries[5].fieldValue } }
                        ]
                    }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return response.body;
    }
}
