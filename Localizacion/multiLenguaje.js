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
    function (session) {
        if (!session.userData.tieneLocale) {
            session.beginDialog('/obtenerIdioma');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        builder.Prompts.text(session, 'preguntar_nombre');
    },
    function (session, results, next) {
        let nombre = results.response;
        let msj = session.localizer.gettext(session.preferredLocale(), 'saludar_nombre');

        session.send(msj + nombre);
        
        // Este next() nos sirve para la "prueba de la pizza"
        next();
    },
    function (session, results) {
        builder.Prompts.confirm(session, 'pregunta_pizza', { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        session.endDialog("Ok!");
    }
]);

// Preguntamos el idioma y lo guardamos en userData
bot.dialog('/obtenerIdioma', [
    function (session) {
        let opciones = locales.map(l => l.name).join('|');
        builder.Prompts.choice(session, 'preguntar_locale', opciones, { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        let locale = locales.find(l => l.name == results.response.entity);
        if (locale) {
            session.tieneLocale = true;

            session.preferredLocale(locale.code, err => {
                if (!err) {
                    session.endDialog('bienvenido');
                } else {
                    session.error(err);
                }
            });
        }
        else
            session.error('locale_invalido');
    }
]);

// Tengo un diccionario de los distintos locales
let locales = [
    { code: 'en', name: 'Select English as preferred language' },
    { code: 'es', name: 'Selecciona tu idioma preferido' }
];