const { google } = require('googleapis');

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const keys = require('./service-account.json');

async function getAccessToken() {
    const client = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        ['https://www.googleapis.com/auth/spreadsheets'],
    );
    await client.authorize();
    return client.credentials.access_token;
}

async function getSpreadsheetData(token) {
    const sheets = google.sheets({ version: 'v4', auth: token });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: '1GA281t5D_u3-2GobM_rdy3Xa87tKVwv-prlPj3i5zIg',
        range: 'Sheet1!A1:B2',
    })

}

getAccessToken().then((token) => 
    
    getSpreadsheetData(token).then((data) => console.log(data))
);