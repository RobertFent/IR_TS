import ClientWrapper from './ClientWrapper';
import { ISearchBody, ISearchQuery, ISearchResponse, ISource, ISourceArray } from '../types/searchTypes';
import Logger from './Logger';

export default class RequestHandler {

    private logger: Logger;
    private client: ClientWrapper;

    public constructor(client: ClientWrapper) {
        this.logger = new Logger(this.constructor.name);
        this.client = client;
    }

    public handleSearchQuery = async (searchQuery: ISearchQuery): Promise<ISourceArray> => {
        // const searchBodyArray: ISearchBodyArray = [];
        const searchBody: ISearchBody = {};
        const test: any = [];
        Object.keys(searchQuery).forEach((key) => {
            const value = searchQuery[key];
            if (value) {
                this.logger.debug(`${key}: ${value}`);
                searchBody[key] = value;
                test.push({match: {[key]: value}});
                // searchBodyArray.push({match: {[key]: value}});
            }
        });
        this.logger.debug(JSON.stringify(test));
        // todo make this work
        // const searchResult = await this.client.getSearchResultsByQuery(test);
        const searchResult = await this.client.getSearchResultsByQuery(searchBody);
        return this.parseSearchResult(searchResult);
    }

    private parseSearchResult = (searchResult: ISearchResponse<ISource>): ISourceArray => {
        const parsedResults: ISourceArray = [];
        for (const hit of searchResult.hits.hits) {
            parsedResults.push(
                {
                    id: hit._source.id,
                    content: hit._source.content,
                    title: hit._source.title,
                    // todo mediaTye in elastic 'media-type'
                    mediaType: hit._source.mediaType,
                    source: hit._source.source,
                    published: hit._source.published
                }
            );
        }
        return parsedResults;
    }
}
