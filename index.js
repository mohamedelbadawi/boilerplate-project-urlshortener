require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});
const originalUrls = [];
const shortUrls = [];

app.post('/api/shorturl/', (req, res) => {

  var url = req.body.url;
  if (url[url.length - 1] === '/') {
    url = url.substring(0, url.length - 1);
  }
  let domain = (new URL(url));
  dns.lookup(domain.hostname, (error, address, family) => {
   
    if (error) {
      return res.json({ error: 'invalid url' });
    }
    else {
      const foundedUrl = originalUrls.indexOf(url);
      if (foundedUrl < 0) {
        if (url.includes("https://") || url.includes("http://")) {
          originalUrls.push(url);
        }
        else {
          originalUrls.push("https://" + url);
        }
        shortUrls.push(shortUrls.length);
        return res.json({ original_url: url, short_url: shortUrls.length - 1 });
      }
      return res.json({ original_url: url, short_url: shortUrls[foundedUrl] });
    }
  })

});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = parseInt(req.params.shorturl);
  const foundIndex = shortUrls.indexOf(shortUrl);
  if (foundIndex < 0) {
    return res.json({ error: "error" });
  }
  return res.redirect(originalUrls[foundIndex]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
