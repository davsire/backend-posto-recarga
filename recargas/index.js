const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const db = new sqlite3.Database('./dados.db', (err) => {
  if (err) {
    console.log('Erro ao acessar o banco de dados de recargas.');
    throw err;
  }
  console.log('Conectado ao banco de dados de recargas.');
});

db.run(
  `
    CREATE TABLE IF NOT EXISTS recargas (
      codigo INT NOT NULL,
      cpf NUMERIC(11) NOT NULL,
      estacao INT NOT NULL,
      posto INT NOT NULL,
      PRIMARY KEY (codigo)
    )
  `,
  [],
  (err) => {
    if (err) {
      console.log('Erro ao criar tabela de recargas.');
      throw err;
    }
  }
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const URL_USUARIOS =  'http://localhost:9020/usuarios/';
const URL_ESTACOES =  'http://localhost:9030/estacoes/';
const URL_COBRANCAS =  'http://localhost:9040/cobrancas/';

app.get('/recargas', (req, res, next) => {
  db.all(
    'SELECT * FROM recargas',
    [],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter recargas: ' + err.message);
        res.status(500).send('Erro ao obter recargas');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.get('/recargas/:cpf', (req, res, next) => {
  db.all(
    'SELECT * FROM recargas WHERE cpf = ?',
    [req.params.cpf],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter recarga: ' + err.message);
        res.status(500).send('Erro ao obter recarga');
        return;
      }
      if (result == null) {
        console.log('Recarga não encontrada');
        res.status(404).send('Recarga não encontrada');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.post('/recargas', async (req, res, next) => {
  db.run(
    `
      INSERT INTO recargas (codigo, cpf, estacao, posto)
      VALUES ((SELECT COALESCE(MAX(codigo), 0) + 1 FROM recargas), ?, ?, ?)
    `,
    [req.body.cpf, req.body.estacao, req.body.posto],
    async function (err) {
      if (err) {
        console.log('Erro ao cadastrar recarga: ' + err.message);
        res.status(500).send('Erro ao cadastrar recarga');
        return;
      }
      const {cpf, estacao, posto, valor} = req.body;
      let usuario;
      try {
        usuario = (await axios.get(URL_USUARIOS + cpf)).data;
        await axios.post(URL_ESTACOES, {estacao, posto});
        await axios.post(URL_COBRANCAS, {recarga: this.lastID, valor});
      } catch (err) {
        res.status(500).send('Ocorreu algum erro nos cadastros relacionados à recarga');
        console.log('Ocorreu algum erro nos cadastros relacionados à recarga: ' + err.message);
        return;
      }
      res.status(200).send('Recarga realizada com sucesso para o usuário ' + usuario.nome);
    }
  )
});

const porta = 9050;
app.listen(porta, () => console.log('API de recargas UP'));
