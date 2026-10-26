require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Middleware para parsear los datos del formulario POST
app.use(express.urlencoded({ extended: true }));

// Requerimos el módulo dns nativo para validación
const dns = require('dns');
const urlParser = require('url');

// Estructura en memoria para guardar las URLs
const urlDatabase = {};
let idCounter = 1;

// Endpoint POST para acortar una URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    // Debe empezar obligatoriamente con http:// o https://
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    // Verificamos el hostname mediante DNS
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Guardamos la URL en nuestro objeto de memoria
        const shortUrl = idCounter++;
        urlDatabase[shortUrl] = originalUrl;

        return res.json({
          original_url: originalUrl,
          short_url: shortUrl
        });
      }
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// Endpoint GET para redirigir desde la URL acortada a la original
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
