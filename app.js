/* importar as configurações do servidor */
var app = require('./config/server');

/* parametrizar a porta de escuta */
app.listen(8000, () => {
	console.log('Servidor online');
})