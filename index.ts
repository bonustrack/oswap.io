import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
import cors from 'cors';

export default (app, server) => {
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
  app.use(cors());
  app.use(serveStatic(`${__dirname}/dist`));
  app.get('/', (req, res) => res.sendFile(`${__dirname}/dist/index.html`));
  app.get('*', (req, res) => res.redirect('/'));
}
