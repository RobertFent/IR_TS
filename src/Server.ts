import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import ClientWrapper from './utils/ClientWrapper';
import { Analyzer, Similarities } from './utils/ClientSettings';
import Logger from './utils/Logger';
import Preprocessor from './utils/Preprocessor';
import RequestHandler from './utils/RequestHandler';
import testCollection from '../assets/relevanceJudgments.json';
import fs from 'fs';
import { ISearchQuery, ISourceArray } from './types/searchTypes';
import { ISignalMediaArray } from './types/signalMedia';
import testCollectionJson from '../assets/testCollection.json';

const PORT = 8069;
const JSONPATH = __dirname + '/../../assets/sample-1M.jsonl';
const JSONPATHTESTCOLLECTION = __dirname + '/../../assets/testCollection.json';
const INDEX = 'signal_media';

// init app
const app = express();
// init logger
const logger = new Logger('Server');
const clientWrapper = new ClientWrapper(INDEX);
const preprocessor = new Preprocessor();
const requestHandler = new RequestHandler();

let results: ISourceArray = [];

// creates index + adds entries from jsonl to it
// eslint-disable-next-line no-unused-vars
const initIndexing = async (): Promise<void> => {
    // client with best map compared to other clients
    await clientWrapper.createIndex(Similarities.idf, Analyzer.default);
    const entries = await preprocessor.parseJSONLToJSON(JSONPATH);
    logger.info('Currently parsed entries: ' + Object.keys(entries).length.toString());
    await clientWrapper.indexDocuments(entries);
};

// writes test collection based on given id of documents
// eslint-disable-next-line no-unused-vars
const initTestCollection = async (): Promise<void> => {
    const entries = await preprocessor.parseJSONLToJSON(JSONPATH);
    logger.info('Getting test entries...');
    // index testing documents
    const testEntries: ISignalMediaArray = [];
    // iterate over test collection
    for (const testEntry of testCollection) {
        // iterate over dataset
        for (const entry of entries) {
            // add matching entries to write new json file
            if (testEntry.id === entry.id) testEntries.push(entry);
        }
    }
    fs.writeFileSync(JSONPATHTESTCOLLECTION, JSON.stringify(testEntries));
    logger.info('Test entries wrote!');
};

// creates clients with test collection indexed
// eslint-disable-next-line no-unused-vars
const initTestClients = async (): Promise<void> => {
    const testEntries: ISignalMediaArray = testCollectionJson as unknown as ISignalMediaArray;
    // create a clients w/ different settings
    const lmClient = new ClientWrapper('signal_media_lm_def');
    const lmCustomClient = new ClientWrapper('signal_media_lm_cust');
    const lmStopwordClient = new ClientWrapper('signal_media_lm_stop');
    const dfiClient = new ClientWrapper('signal_media_dfi_def');
    const dfiCustomClient = new ClientWrapper('signal_media_dfi_cust');
    const idfClient = new ClientWrapper('signal_media_idf_def');
    const idfCustomClient = new ClientWrapper('signal_media_idf_cust');
    const idfStopwordClient = new ClientWrapper('signal_media_idf_stop');
    // create index for each client
    await Promise.all([
        lmClient.createIndex(Similarities.lm, Analyzer.default),
        lmCustomClient.createIndex(Similarities.lm, Analyzer.custom),
        lmStopwordClient.createIndex(Similarities.lm, Analyzer.stopword),
        dfiClient.createIndex(Similarities.dfi, Analyzer.default),
        dfiCustomClient.createIndex(Similarities.dfi, Analyzer.custom),
        idfClient.createIndex(Similarities.idf, Analyzer.default),
        idfCustomClient.createIndex(Similarities.idf, Analyzer.custom),
        idfStopwordClient.createIndex(Similarities.idf, Analyzer.stopword)
    ]);
    // index above parsed files to each index
    await Promise.all([
        lmClient.indexDocuments(testEntries),
        lmCustomClient.indexDocuments(testEntries),
        lmStopwordClient.indexDocuments(testEntries),
        dfiClient.indexDocuments(testEntries),
        dfiCustomClient.indexDocuments(testEntries),
        idfClient.indexDocuments(testEntries),
        idfCustomClient.indexDocuments(testEntries),
        idfStopwordClient.indexDocuments(testEntries)
    ]);
};

// config express to use ejs
// todo dirty path
app.set('views', path.join(__dirname, '/../../frontend/views/pages'));
app.set('view engine', 'ejs');

// for css
app.use(express.static(__dirname + '/../../frontend/assets'));

// middleware
app.use(bodyParser.urlencoded({ extended: true }));

// mainpage route
app.get('/', async (req: express.Request, res: express.Response): Promise<void> => {
    res.render('index', { results: results });
});

// todo show number hits etc
// todo make css look nice
app.post('/search', async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        results = await requestHandler.handleSearchQuery(req.body as ISearchQuery, clientWrapper);    
    } catch (error) {
        logger.error(error);
    } finally {
        res.redirect('/');
    }
    // logger.debug(JSON.stringify(results));
});

// start server on given port (8069)
app.listen(PORT, async (): Promise<void> => {
    logger.info(`Server started at: http://localhost:${PORT}`);
    // uncomment following lines when starting this server on your machine for the first time
    // await initIndexing();
    // await initTestCollection();
    // await initTestClients();
});
