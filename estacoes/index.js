const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const TEMPO_RECARGA_ESTACAO = 3000;

app.post('/estacoes', (req, res, next) => {
  if (!req.body.estacao || !req.body.posto) {
    res.status(400).send('É necessário informar o código do posto e da estação');
    return;
  }
  res.status(200).send(`Liberando estação ${req.body.estacao} do posto ${req.body.posto}`);
  console.log(`[Posto: ${req.body.posto} - Estação: ${req.body.estacao}] Iniciando recarga...`);
  setTimeout(() => {
    console.log(`[Posto: ${req.body.posto} - Estação: ${req.body.estacao}] Recarga finalizada!`);
  }, TEMPO_RECARGA_ESTACAO);
});

const porta = 9030;
app.listen(porta, () => console.log('API de estações UP'));
