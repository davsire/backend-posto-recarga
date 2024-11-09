const httpProxy = require('express-http-proxy');
const express = require('express');
const logger = require('morgan');
const app = express();

app.use(logger('dev'));

const DOMINIO_BASE = 'http://localhost';

const selectProxyHost = (req) => {
  if (req.path.startsWith('/postos')) {
    return DOMINIO_BASE + ':9010/';
  }
  if (req.path.startsWith('/usuarios')) {
    return DOMINIO_BASE + ':9020/';
  }
  if (req.path.startsWith('/estacoes')) {
    return DOMINIO_BASE + ':9030/';
  }
  if (req.path.startsWith('/cobrancas')) {
    return DOMINIO_BASE + ':9040/';
  }
  if (req.path.startsWith('/recargas')) {
    return DOMINIO_BASE + ':9050/';
  }
  return null;
}

app.use((req, res, next) => {
  const proxy = selectProxyHost(req);
  if (!proxy) {
    res.status(404).send('Not found');
    return;
  }
  httpProxy(proxy)(req, res, next);
});

const porta = 9000;
app.listen(porta, () => console.log('Backend posto recarga UP'));
