const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require('body-parser');

const db = new sqlite3.Database('./dados.db', (err) => {
  if (err) {
    console.log('Erro ao acessar o banco de dados de cobranças.');
    throw err;
  }
  console.log('Conectado ao banco de dados de cobranças.');
});

db.run(
  `
    CREATE TABLE IF NOT EXISTS cobrancas (
      codigo INT NOT NULL UNIQUE,
      recarga INT NOT NULL UNIQUE,
      valor NUMERIC(126, 3) NOT NULL,
      PRIMARY KEY (codigo)
    )
  `,
  [],
  (err) => {
    if (err) {
      console.log('Erro ao criar tabela de cobranças.');
      throw err;
    }
  }
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/cobrancas', (req, res, next) => {
  db.all(
    'SELECT * FROM cobrancas',
    [],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter cobranças: ' + err.message);
        res.status(500).send('Erro ao obter cobranças');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.get('/cobrancas/recarga/:codigo', (req, res, next) => {
  db.get(
    'SELECT * FROM cobrancas WHERE recarga = ?',
    [req.params.codigo],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter cobrança: ' + err.message);
        res.status(500).send('Erro ao obter cobrança');
        return;
      }
      if (result == null) {
        console.log('Cobrança não encontrada');
        res.status(404).send('Cobrança não encontrada');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.post('/cobrancas', (req, res, next) => {
  db.run(
    'INSERT INTO cobrancas (codigo, recarga, valor) VALUES (COALESCE((SELECT MAX(codigo) FROM cobrancas), 0) + 1, ?, ?)',
    [req.body.recarga, req.body.valor],
    (err) => {
      if (err) {
        console.log('Erro ao cadastrar cobrança: ' + err.message);
        res.status(500).send('Erro ao cadastrar cobrança');
        return;
      }
      console.log(`Realizando cobrança no valor de R$${req.body.valor} para a recarga de código ${req.body.recarga}`);
      res.status(200).send('Cobrança cadastrada com sucesso');
    }
  )
});

const porta = 9040;
app.listen(porta, () => console.log('API de cobranças UP'));
