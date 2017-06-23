var restify = require('restify');
var builder = require('botbuilder');
var dotenv = require('dotenv');

// Levantar restify
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// No te preocupes por estas credenciales por ahora, luego las usaremos para conectar los canales.
var connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
});

// Ahora utilizamos un UniversalBot
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Para utilizar variables de entorno
dotenv.config(); 

let luisApp = process.env.LUIS_APP;
let luisKey = process.env.LUIS_KEY;

// Crear un procesador LUIS que apunte a nuestro modelo en el root (/)
var model = `https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/${luisApp}?subscription-key=${luisKey}&timezoneOffset=0.0&verbose=true`;

var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

// Esta función se ejecuta cuando el Intent == ordenarTaxi
dialog.matches('ordenarTaxi', [
    function (session, args, next) {
        builder.Prompts.text(session, '¿A dónde lo envío?');
    },
    function(session, args) {
        session.send(`Enviando taxi a **${args.response}**`)
    }
]);

dialog.matches('cancelarTaxi', [
    function (session, args, next) {
        session.send('Ok, cancelaré tu taxi.')
    }
]);

//Este es el Default, cuando LUIS no entendió la consulta.
dialog.onDefault(builder.DialogAction.send("No entendí. Me lo decís de nuevo pero de otra manera, por favor?"));