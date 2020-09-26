import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import ClientWrapper from './utils/ClientWrapper';
import Logger from './utils/Logger';
import Preprocessor from './utils/Preprocessor';
import RequestHandler from './utils/RequestHandler';
import { ISearchQuery, ISourceArray } from './types/searchTypes';

const PORT = 8069;
const JSONPATH = __dirname + '/../assets/sample-1M.jsonl';
const INDEX = 'signal-media';

// init app
const app = express();
// init logger
const logger = new Logger('Server');
const clientWrapper = new ClientWrapper(INDEX);
const preprocessor = new Preprocessor();
const requestHandler = new RequestHandler(clientWrapper);

let results: ISourceArray = [];

// creates index + adds entries from jsonl to it
// eslint-disable-next-line no-unused-vars
const initIndexing = async (): Promise<void> => {
    await clientWrapper.createIndex();
    const entries = await preprocessor.parseJSONLToJSON(JSONPATH);
    logger.info('Currently parsed entries: ' + Object.keys(entries).length.toString());
    await clientWrapper.indexDocuments(entries);
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
    results = await requestHandler.handleSearchQuery(req.body as ISearchQuery);
    // logger.debug(JSON.stringify(results));
    res.redirect('/');
});

// start server on port 420
app.listen(PORT, async (): Promise<void> => {
    logger.info(`Server started at: http://localhost:${PORT}`);
    // uncomment following line when starting this server on your machine for the first time
    // await initIndexing();
});
