const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require('body-parser');

const db = new sqlite3.Database('./dados.db', (err) => {
  if (err) {
    console.log('Erro ao acessar o banco de dados de postos.');
    throw err;
  }
  console.log('Conectado ao banco de dados de postos.');
});

db.run(
  `
    CREATE TABLE IF NOT EXISTS postos (
      codigo INT NOT NULL UNIQUE,
      localizacao VARCHAR(40) NOT NULL,
      PRIMARY KEY (codigo)
    )
  `,
  [],
  (err) => {
    if (err) {
      console.log('Erro ao criar tabela de postos.');
      throw err;
    }
  }
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/postos', (req, res, next) => {
  db.all(
    'SELECT * FROM postos',
    [],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter postos: ' + err.message);
        res.status(500).send('Erro ao obter postos');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.get('/postos/:codigo', (req, res, next) => {
  db.get(
    'SELECT * FROM postos WHERE codigo = ?',
    [req.params.codigo],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter posto: ' + err.message);
        res.status(500).send('Erro ao obter posto');
        return;
      }
      if (result == null) {
        console.log('Posto não encontrado');
        res.status(404).send('Posto não encontrado');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.post('/postos', (req, res, next) => {
  db.run(
    'INSERT INTO postos (codigo, localizacao) VALUES (?, ?)',
    [req.body.codigo, req.body.localizacao],
    (err) => {
      if (err) {
        console.log('Erro ao cadastrar posto: ' + err.message);
        res.status(500).send('Erro ao cadastrar posto');
        return;
      }
      res.status(200).send('Posto cadastrado com sucesso');
    }
  )
});

app.patch('/postos/:codigo', (req, res, next) => {
  db.run(
    'UPDATE postos SET localizacao = COALESCE(?, localizacao) WHERE codigo = ?',
    [req.body.localizacao, req.params.codigo],
    (err) => {
      if (err) {
        console.log('Erro ao atualizar posto: ' + err.message);
        res.status(500).send('Erro ao atualizar posto');
        return;
      }
      if (this.changes == 0) {
        console.log('Posto não encontrado');
        res.status(404).send('Posto não encontrado');
        return;
      }
      res.status(200).send('Posto atualizado com sucesso');
    }
  )
});

app.delete('/postos/:codigo', (req, res, next) => {
  db.run(
    'DELETE FROM postos WHERE codigo = ?',
    [req.params.codigo],
    (err) => {
      if (err) {
        console.log('Erro ao excluir posto: ' + err.message);
        res.status(500).send('Erro ao excluir posto');
        return;
      }
      if (this.changes == 0) {
        console.log('Posto não encontrado');
        res.status(404).send('Posto não encontrado');
        return;
      }
      res.status(200).send('Posto excluído com sucesso');
    }
  )
});

const porta = 9010;
app.listen(porta, () => console.log('API de postos UP'));
