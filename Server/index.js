const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = '7ed7bef3e0bf5f5fb95c7fb269015c6d48eb1c41108af4c9d66d0a67a7a4f8f0'; 
const SPREADSHEET_ID = '1oDvNiULkM1W0qFx25OqZgW-1H7nKyX8_oJIxO8dtej4'; 

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

async function addToGoogleSheet(data) {
  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo(); 

    const sheet = doc.sheetsByIndex[0]; 
    await sheet.addRow(data); 

    console.log('Datos agregados a la hoja de cálculo.');
  } catch (error) {
    console.error('Error al agregar datos a la hoja de cálculo:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
