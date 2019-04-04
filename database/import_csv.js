import CSVLoader from 'api/csv';
import connect, { disconnect } from 'api/utils/connect_to_mongo';
import users from 'api/users/users';

const { template, username, language, file } = require('yargs') // eslint-disable-line
.option('template', {
  alias: 't',
  describe: '_id of a template',
})
.option('file', {
  alias: 'f',
  describe: 'path to the csv file to import',
})
.option('username', {
  alias: 'u',
  describe: 'user to be assigned to imported entities',
  default: 'admin',
})
.option('language', {
  alias: 'l',
  describe: 'language to be used for the import',
  default: 'en',
})
.demandOption(['template', 'file'], '\n\n')
.argv;

const loader = new CSVLoader();

let loaded = 0;
let errors = 0;

loader.on('entityLoaded', () => {
  loaded += 1;
  process.stdout.write(`imported ${loaded} entities ...\r`);
});

loader.on('loadError', (error, entity, index) => {
  errors += 1;
  process.stdout.write(`\n an error ocurred importing entity number ${index} ${entity.title} =>`);
  process.stdout.write(`\n ${error} \n`);
});

process.stdout.write('\n');

connect()
.then(() => users.get({ username }))
.then(([user]) => loader.load(file, template, { language, user }))
.then(() => {
  process.stdout.write(` 🎉 imported ${loaded} entities succesfully\n`);
  process.stdout.write('\n\n');
  disconnect();
})
.catch(() => {
  process.stdout.write('\n\n');
  process.stdout.write(` 🎉 imported ${loaded} entities succesfully\n`);
  process.stdout.write(` ‼ ${errors} entities had errors and were not imported\n`);
  process.stdout.write('\n\n');
  disconnect();
});
