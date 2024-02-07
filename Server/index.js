const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const {google} = require('googleapis');
const sheets = google.sheets('v4');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = '7ed7bef3e0bf5f5fb95c7fb269015c6d48eb1c41108af4c9d66d0a67a7a4f8f0'; 
const SPREADSHEET_ID = '1oDvNiULkM1W0qFx25OqZgW-1H7nKyX8_oJIxO8dtej4'; 

/*fs.readFile('integracion-mp-1bf8d9edb5a4.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), addColumn);
});



fs.readFile(path.join(__dirname, 'token.json'), (err, token) => {
  if (err) return getNewToken(oAuth2Client, callback); // getNewToken is a function you need to define to handle the auth flow
  oAuth2Client.setCredentials(JSON.parse(token));
  callback(oAuth2Client);
});
*/
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Set token for auth (assuming you already have one, see Google's OAuth2 documentation on how to get it)
  // This is usually obtained through a previous authorization process
  // Here you would load your token from a file or environment variable
  getNewToken(oAuth2Client);

  callback(oAuth2Client);
}


function getNewToken(oAuth2Client, callback) {
// Generate the auth URL and prompt the user to visit it and get the authorization code
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/spreadsheets'],
});

console.log('Authorize this app by visiting this url:', authUrl);
// Further steps would involve capturing the code from the URL, exchanging it for a token, and then storing the token.
}

app.use(bodyParser.json());

app.get("/", (req, res) => {
    const htmlResponse = `
    <html>
        <head>
            <title>NodeJs Project</title>
        </head>
        <body>
            <h1>Proyecto en Vercel</h1>
        </body>
    </html>
    `;
    res.send(htmlResponse);
});

app.post('/webhook-receiver', async (req, res) => {
  const payload = req.body;
  const receivedSignature = req.get('x-signature');

 
  const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(JSON.stringify(payload)).digest('hex');
  if (receivedSignature === expectedSignature) {
    
    console.log('Notificación recibida:', payload);

    
    if (payload.type === 'payment' && payload.action === 'payment.created') {
      // Agregar datos a la hoja de cálculo
      await addToGoogleSheet(payload);
    }

    res.status(200).send('OK');
  } else {
    
    console.error('Firma no válida. Posible intento de manipulación.');
    res.status(400).send('Bad Request');
  }
});

