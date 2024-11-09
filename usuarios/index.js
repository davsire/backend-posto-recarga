const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require('body-parser');

const db = new sqlite3.Database('./dados.db', (err) => {
  if (err) {
    console.log('Erro ao acessar o banco de dados de usuários.');
    throw err;
  }
  console.log('Conectado ao banco de dados de usuários.');
});

db.run(
  `
    CREATE TABLE IF NOT EXISTS usuarios (
      cpf NUMERIC(11) NOT NULL UNIQUE,
      nome VARCHAR(40) NOT NULL,
      email VARCHAR(40),
      cartao_credito NUMERIC(16) NOT NULL,
      PRIMARY KEY (cpf)
    )
  `,
  [],
  (err) => {
    if (err) {
      console.log('Erro ao criar tabela de usuários.');
      throw err;
    }
  }
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/usuarios', (req, res, next) => {
  db.all(
    'SELECT * FROM usuarios',
    [],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter usuários: ' + err.message);
        res.status(500).send('Erro ao obter usuários');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.get('/usuarios/:cpf', (req, res, next) => {
  db.get(
    'SELECT * FROM usuarios WHERE cpf = ?',
    [req.params.cpf],
    (err, result) => {
      if (err) {
        console.log('Erro ao obter usuário: ' + err.message);
        res.status(500).send('Erro ao obter usuário');
        return;
      }
      if (result == null) {
        console.log('Usuário não encontrado');
        res.status(404).send('Usuário não encontrado');
        return;
      }
      return res.status(200).json(result);
    }
  )
});

app.post('/usuarios', (req, res, next) => {
  db.run(
    'INSERT INTO usuarios (cpf, nome, email, cartao_credito) VALUES (?, ?, ?, ?)',
    [req.body.cpf, req.body.nome, req.body.email, req.body.cartao_credito],
    (err) => {
      if (err) {
        console.log('Erro ao cadastrar usuário: ' + err.message);
        res.status(500).send('Erro ao cadastrar usuário');
        return;
      }
      res.status(200).send('Usuário cadastrado com sucesso');
    }
  )
});

app.patch('/usuarios/:cpf', (req, res, next) => {
  db.run(
    'UPDATE usuarios SET nome = COALESCE(?, nome), email = COALESCE(?, email), cartao_credito = COALESCE(?, cartao_credito) WHERE cpf = ?',
    [req.body.nome, req.body.email, req.body.cartao_credito, req.params.cpf],
    function (err) {
      if (err) {
        console.log('Erro ao atualizar usuário: ' + err.message);
        res.status(500).send('Erro ao atualizar usuário');
        return;
      }
      if (this.changes == 0) {
        console.log('Usuário não encontrado');
        res.status(404).send('Usuário não encontrado');
        return;
      }
      res.status(200).send('Usuário atualizado com sucesso');
    }
  )
});

app.delete('/usuarios/:cpf', (req, res, next) => {
  db.run(
    'DELETE FROM usuarios WHERE cpf = ?',
    [req.params.cpf],
    function (err) {
      if (err) {
        console.log('Erro ao excluir usuário: ' + err.message);
        res.status(500).send('Erro ao excluir usuário');
        return;
      }
      if (this.changes == 0) {
        console.log('Usuário não encontrado');
        res.status(404).send('Usuário não encontrado');
        return;
      }
      res.status(200).send('Usuário excluído com sucesso');
    }
  )
});

const porta = 9020;
app.listen(porta, () => console.log('API de usuários UP'));
