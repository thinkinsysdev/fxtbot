/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var clients= require("restify-clients");
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';

//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
const LuisModelUrl = 'https://api.projectoxford.ai/luis/v2.0/apps/7be4a650-bdc0-4203-a697-0f0927279385?subscription-key=389abfefaa184be28abfaf41e3cfc468';
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('getCurrency', (session, args) => {

    console.log(session.message.text);
    var reqText = session.message.text;
     var symbolText = "USD,EUR";
      var  symbol = "EUR";
      var pairText = "EURUSD";
      var found = false;






    if ( reqText.indexOf("GBPUSD") >= 0) {
        symbolText = "USD,GBP";
        pairText = "GBPUSD";
        symbol = "GBP";
        found = true;
    } else if (reqText.indexOf ("EURUSD") >= 0 )
    {
        symbolText = "USD,EUR";
        pairText = "EURUSD";
        symbol = "EUR";
        found = true;
    } else if (reqText.indexOf ("NZDUSD") >= 0 )
    {
        symbolText = "USD,NZD";
        pairText = "NZDUSD";
        symbol = "NZD";
        found = true;
    } else if (reqText.indexOf ("AUDUSD") >= 0 )
    {
        symbolText = "USD,AUD";
        pairText = "AUDUSD";
        symbol = "AUD";
        found = true;
    }

    console.log (" Symbol Text : " + symbolText);

    var client = clients.createJsonClient({
        url: 'http://api.fixer.io'
    });
  client.get('/latest?symbols=' + symbolText + '&base=USD', function (err, req, res, obj) {
  //  client.get('/latest?symbols=USD,GBP', function (err, req, res, obj) {
 // assert.ifError(err);
 // console.log('Server returned: %j', obj.base);
 // console.log('result ' + obj.rates.USD)
 console.log(obj);
 console.log('result ' + obj.rates[symbol]);
  //session.send("The rate for GBPUSD is: \'%s\'.", obj.rates.USD);
  if (found)
  {
  session.send("The rate for " + pairText + " is: \'%s\'.", obj.rates[symbol]);
   }
   else {
    session.send("The pair is not defined in the source.")
   }
  
});


   // session.send("Hi, The currency that you asked for is: \'%s\'.", session.message.text);
})
.matches('Simple', (session, args) => {
    session.send("Hi, Simple Intent triggered: \'%s\'.", session.message.text);
})
.matches('None', (session, args) => {
    session.send('You said: \'%s\'.', session.message.text);
})
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

