import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import ClientWrapper, { Analyzer, Similarities } from './utils/ClientWrapper';
import Logger from './utils/Logger';
import Preprocessor from './utils/Preprocessor';
import RequestHandler from './utils/RequestHandler';
import testCollection from '../assets/relevanceJudgments.json';
import fs from 'fs';
import { ISearchQuery, ISourceArray } from './types/searchTypes';
import { ISignalMediaArray } from './types/signalMedia';

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
    // create a few indices for later comparison
    const lmClient = new ClientWrapper('signal_media_lm');
    const dfiClient = new ClientWrapper('signal_media_dfi');
    await Promise.all([
        lmClient.createIndex(Similarities.lm, Analyzer.default),
        dfiClient.createIndex(Similarities.dfi, Analyzer.default)
    ]);
    // index above parsed files to each index
    await Promise.all([
        lmClient.indexDocuments(testEntries),
        dfiClient.indexDocuments(testEntries)
    ]);
};

// config express to use ejs
// todo dirty path
app.set('views', path.join(__dirname, '/../frontend/views/pages'));
app.set('view engine', 'ejs');

// for css
app.use(express.static(__dirname + '/../frontend/assets'));

// middleware
app.use(bodyParser.urlencoded({ extended: true }));

// mainpage route
app.get('/', async (req: express.Request, res: express.Response): Promise<void> => {
    res.render('index', { results: results });
});

// todo show number hits etc
// todo results with more than one field not working
// todo make css look nice
app.post('/search', async (req: express.Request, res: express.Response): Promise<void> => {
    results = await requestHandler.handleSearchQuery(req.body as ISearchQuery, clientWrapper);
    // logger.debug(JSON.stringify(results));
    res.redirect('/');
});

// start server on port 420
app.listen(PORT, async (): Promise<void> => {
    logger.info(`Server started at: http://localhost:${PORT}`);
    // uncomment following lines when starting this server on your machine for the first time
    // await initIndexing();
    // await initTestCollection();
});
