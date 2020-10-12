import ClientWrapper from './ClientWrapper';
import { ISearchBody, ISearchQueries, ISearchQuery, ISearchResponse, ISource, ISourceArray } from '../types/searchTypes';
import Logger from './Logger';

export default class RequestHandler {

    private logger: Logger;

    public constructor() {
        this.logger = new Logger(this.constructor.name);
    }

    public handleSearchQuery = async (searchQuery: ISearchQuery, client: ClientWrapper): Promise<ISourceArray> => {
        const searchBody: ISearchBody = {};
        // remove unfilled rows
        Object.keys(searchQuery).forEach((key) => {
            const value = searchQuery[key];
            if (value) searchBody[key] = value;
        });

        const sumKeys = Object.keys(searchBody).length;
        if (sumKeys > 0) {
            // get searchQuery as array
            const searchQueries: ISearchQueries = [];
            Object.keys(searchBody).forEach((key) => searchQueries.push({ fieldName: key, fieldValue: searchBody[key] }));

            const searchRes: ISearchResponse<ISource> = await client.getSearchResults(searchQueries, sumKeys);
            // this.logger.debug(JSON.stringify(searchRes));
            return this.parseSearchResult(searchRes);
        }
        return [];
    }

    private parseSearchResult = (searchResult: ISearchResponse<ISource>): ISourceArray => {
        const parsedResults: ISourceArray = [];
        for (const hit of searchResult.hits.hits) {
            parsedResults.push(
                {
                    id: hit._source.id,
                    content: hit._source.content,
                    title: hit._source.title,
                    mediaType: hit._source.mediaType,
                    source: hit._source.source,
                    published: hit._source.published
                }
            );
        }
        return parsedResults;
    }
}
