const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8080;
const sampleHostsData = JSON.parse(
  fs.readFileSync('./data/hosts.json', 'utf8')
);

const getRandomHost = () => {
  const seed = (Math.random().toString(16) + '000000000').substr(2, 8);

  return {
    id: 'random-host-' + seed,
    name: 'A Random Host (' + seed + ')'
  };
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// toggle-mode

// get-hosts

app.get('/get-hosts', (req, res, next) => {
  res.json(sampleHostsData);
});

// get-random-host

app.get('/get-random-host', (req, res, next) => {
  const newHost = getRandomHost();
  console.log(newHost);
  res.json(newHost);
});

// delete-host/:id

app.listen(port, () => {
  console.log(`Listening http://localhost:${port}/`);
});

app.use((err, req, res, next) => {
  console.log(`There's some weird ${err.name} in the house.`);
  res.status(err.statusCode || 500).send(err.message);
});
