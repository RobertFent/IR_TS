/* eslint-disable no-unused-vars */
import { Client } from '@elastic/elasticsearch';
import { ISearchBody, ISearchResponse, ISource } from '../types/searchTypes';
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
                            similarity : 'my_similarity'
                        },
                        published: { 'type': 'text' },
                        title: {
                            type: 'text',
                            analyzer: 'my_custom_analyzer',
                            similarity : 'my_similarity'
                        },
                        'media-type': {
                            type: 'text',
                            analyzer: 'my_custom_analyzer',
                            similarity : 'my_similarity'
                        },
                        content: {
                            type: 'text',
                            analyzer: 'my_custom_analyzer',
                            similarity : 'my_similarity'
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

    public getSearchResultsBySingleParam = async (fieldName: string, fieldValue: string): Promise<string> => {
        const response = await this.client.search({
            index: this.index,
            body: {
                query: {
                    match: { [fieldName]: fieldValue }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return JSON.stringify(response.body.hits);
    }

    // AND matching
    // todo remove any
    public getSearchResultsByQuery = async (searchBody: ISearchBody | any): Promise<ISearchResponse<ISource>> => {
        // following request works
        // todo generic for up to 5 params
        // todo add ',' if more than one param is given 
        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: {
                    match: searchBody
                }
            }
        });
        /* // const query = JSON.stringify(searchBody).replace(/"/g, '').replace(/\\/g, '');
        const query = {...searchBody};
        const body = {
            body: {query}
        };
        try {
            const response = await this.client.search<ISearchResponse<ISource>>({
                index: this.index,
                body: {
                    query: {searchBody} 
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
        }); */
        return response.body;
    }
}
