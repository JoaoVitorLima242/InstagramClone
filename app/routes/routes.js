module.exports = (application) => {
	application.get('/', (req, res) => {
		application.app.controllers.index.index(application, req, res);
	});

	application.get('/home', (req, res) => {
		application.app.controllers.home.home(application, req, res);
	});

}