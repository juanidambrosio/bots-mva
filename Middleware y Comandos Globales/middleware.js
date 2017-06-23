var restify = require('restify');
var builder = require('botbuilder');

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

// Agregamos nuestro middleware
bot.use({
    botbuilder: function (session, next) {
        logMensajeEntrante(session, next);
    },
    send: function (event, next) {
        logMensajeSaliente(event, next);
    }
})

// Dialogos
bot.dialog('/', [
    function (session, results, next) {
        builder.Prompts.text(session, '¿Cómo te llamas?');
    },
    function (session, results) {
        session.dialogData.nombre = results.response;
        session.send(`Hola ${session.dialogData.nombre}!`);
    }
]);

// Esta es la lógica de ejecución del middlware
function logMensajeEntrante(session, next) {
    console.log('Estamos grabando: ' + session.message.text);
    next();
}

function logMensajeSaliente(event, next) {
    console.log(event.text);
    next();
}