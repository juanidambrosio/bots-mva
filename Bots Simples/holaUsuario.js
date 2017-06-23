var builder = require('botbuilder');

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, '¿Cómo te llamas?');
    },
    function (session, results) {
        let msj = results.response;
        session.send(`Hola ${msj}!`);
    }
]);