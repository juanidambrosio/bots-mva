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

// Dialogos
bot.dialog('/', [
    function (session, results, next) {
        builder.Prompts.text(session, '¿Cómo te llamas?');
    },
    function (session, results) {
        session.dialogData.nombre = results.response;
        builder.Prompts.number(session, `Ok, ${session.dialogData.nombre}. ¿Cuál es tu edad?`);
    },
    function (session, results) {
        session.dialogData.edad = results.response;
        builder.Prompts.time(session, `¿Qué hora es?`);
    },
    function (session, results) {
        session.dialogData.hora = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.choice(session, '¿Cuál prefieres?', 'Mar|Montaña');
    },
    function (session, results) {
        session.dialogData.preferencia = results.response.entity;
        builder.Prompts.confirm(session, '¿Quieres ver un resumen?');
    },
    function (session, results) {
        if (results.response) {
            session.endDialog(`Me contaste que tu nombre es **${session.dialogData.nombre}**, tienes **${session.dialogData.edad}** años, son las **${session.dialogData.hora}** y prefieres **${session.dialogData.preferencia}**`);
        }
        else {
            session.endDialog('Adios!');
        }
    }
])
.cancelAction('cancelarDialogAction', 'Cancelado', { matches: /^cancelar$/i })
.beginDialogAction('interrumpirDialogAction', '/Interrumpir', { matches: /^interrumpir$/i })

// Este diálogo se dispara cuando el usuario dice "interrumpir" en el alcance del diálogo raíz
// Se puede evitar la continuación llamando a la bandera "promptAfterAction"
bot.dialog('/Interrumpir', [
    function (session) {
        builder.Prompts.confirm(session, '¿Te gusta que te interrumpan?');
    },
    function (session, results) {
        if (results.response) {
            session.endDialog('A mí también');
        }
        else {
            session.endDialog('A mí tampoco');
        }
    }
]);