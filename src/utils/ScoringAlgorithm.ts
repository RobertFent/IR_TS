import data from '../../assets/relevanceJudgments.json';
import { ISourceArray } from '../types/searchTypes';
import ClientWrapper from './ClientWrapper';
import Logger from './Logger';
import RequestHandler from './RequestHandler';

interface ClientMap {
    [key: string]: number[]
}

interface ClientAvgScore {
    [key: string]: number
}

let logger: Logger;

const queries = {
    socialMediaMarketing: 'how to make money with social media',
    dopingSport: 'cheating in sport',
    dataVisualization: 'tools for creating charts',
    bitcoin: 'online trading',
    googleSmartphone: 'googles new smartphone',
    searchEngineOptimization: 'how to optimize my search engine',
    googleStore: 'top apps in googles play store',
    football: 'top football leagues',
    socialMediaPsychology: 'downsides of instagram',
    soccer: 'most paid soccer player'

};

const run = async (): Promise<void> => {
    // init logger + clients + requestHandler
    logger = new Logger('ScoringAlgorithm');
    // todo use test collection for idf client
    // const idfClient = new ClientWrapper('signal_media');
    const lmClient = new ClientWrapper('signal_media_lm');
    const dfiClient = new ClientWrapper('signal_media_dfi');
    const clientMap = await getMapsOfEachClient([lmClient, dfiClient]);
    logger.info(`winner: ${getBestClient(clientMap)}`);
};

// returns obj containing each clientName with its map values per topic
const getMapsOfEachClient = async (clients: ClientWrapper[]): Promise<ClientMap> => {
    const clientMap: ClientMap = {};
    const requestHandler = new RequestHandler();
    // iterate over clients
    for await (const client of clients) {
        clientMap[client.index] = [];
        // iterate over queries
        await new Promise((resolve, _reject) => {
            Object.keys(queries).forEach(async (key, queryIndex) => {
                // get search results of client per query
                const res = await requestHandler.handleSearchQuery({content: queries[key]}, client);
                // get map of first 10 results
                const map = getMap(res.slice(0, 10), key);
                clientMap[client.index].push(map);
                if (queryIndex === Object.keys(queries).length -1) resolve();
            });
        });
    }
    logger.debug(JSON.stringify(clientMap));
    return clientMap;
};

// returns mean average precision
const getMap = (result: ISourceArray, topic: string): number => {
    let correct = 0;
    if (result.length === 0) return 0;
    // iterate over search hits
    for (const singleResult of result) {
        // iterate over judgments in json file
        for (const judgement of data) {
            // compare topics if id matches
            if (singleResult.id === judgement.id) {
                // decide if match is correct or not
                if (judgement.topic === topic) correct++;
            }
        }
    }
    // return percentage (map)
    return correct/10;
};

const getBestClient = (clientMap: ClientMap): string => {
    const clientAvgScore: ClientAvgScore = {};
    // iterate over clients and get avg map value
    Object.keys(clientMap).forEach((clientName) => {
        let score = 0;
        clientMap[clientName].forEach((singleScore) => {
            score += singleScore;
        });
        clientAvgScore[clientName] = score;
    });
    // get name of client with highest avgScore
    const winner = Object.keys(clientAvgScore).reduce((prev, curr) => clientAvgScore[prev] > clientAvgScore[curr] ? prev : curr);
    return winner;
};

run();
