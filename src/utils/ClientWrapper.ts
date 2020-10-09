import { Client } from '@elastic/elasticsearch';
import { ISearchQueries, ISearchResponse, ISource } from '../types/searchTypes';
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

    public getSearchResults = async (searchQueries: ISearchQueries, numParams: number): Promise<ISearchResponse<ISource>> => {
        const must = [] as {
            match: {
                [x: string]: string;
            };
        }[];

        for (let index = 0; index < numParams; index++) {
            must.push({
                match: {
                    [searchQueries[index].fieldName]: searchQueries[index].fieldValue
                }
            });
        }

        const response = await this.client.search<ISearchResponse<ISource>>({
            index: this.index,
            body: {
                query: {
                    bool: {
                        must
                    }
                }
            }
        });
        this.logger.debug('Response body', response.body);
        return response.body;
    }
}
