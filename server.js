// wywołanie pakietów
var express = require('express'); // wywołanie expressa - od tworzenia serwera
var app = express(); // utworzenie serwera
var bodyParser = require('body-parser'); // do parseowania
var morgan = require('morgan'); // do logów w konsoli
var mongoose = require('mongoose'); //mongoose - od bazy danych
var User = require('./app/models/user'); //definiuje model aplikacji (pobranie schematu z user.js)
var port = process.env.PORT || 8080; // ustawienie portu

// konfiguracja aplikacji
app.use(bodyParser.urlencoded({ extended: true }));// bodyParser - parsowanie żądań (żeby wyciągnąć informacje z żądań)
app.use(bodyParser.json());
app.use(function(req, res, next) {// ustawienie konfiguracji aplikacji, aby zapobiec błędom CORS (to pozwala dowolnej domenie na dostęp do API)
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
next();
});
app.use(morgan('dev'));// wypisuje logi żądań do konsoli
mongoose.connect('mongodb://msap:msap@ds039231.mongolab.com:39231/survey');// łączenie się z bazą
// ROUTING
app.get('/', function(req, res) {// routing do strony głównej
res.send('Homepage');
});
var apiRouter = express.Router();// routing do API
apiRouter.use(function(req, res, next) {// funkcja do zalogowania wejścia do API
console.log('Somebody just came to our app!');
next(); // program szuka następnych funkcji, w które może wejść (nie kończy się)
});
apiRouter.get('/', function(req, res) {//routing na (adres)/api	
User.find(function(err, survey) {
if (err) return res.send(err);
res.json(survey);// zwraca ankietowanych
});
});

apiRouter.route('/survey')// routing na (adres)/api/survey
.post(function(req, res) {// tworzenie ankietowanego
var user = new User(); 
user.gender = req.body.gender;//wszystkie zmienne idą z żądania
user.age = req.body.age; 
user.fav_beer = req.body.fav_beer; 
user.how_many = req.body.how_many;
user.where = req.body.where;
user.with_who = req.body.with_who;
user.save(function(err) {
if (err) {
if (err.code == 11000)// błąd bazy przy duplikowaniu id
return res.json({ success: false, message: 'Ankietowicz o tym id już istnieje. '});
else
return res.send(err);
}
res.json({ message: 'Ankieta wysłana!' });// zwraca odpowiedź
});
})
.get(function(req, res) {// odsyła do form.html
res.sendFile(__dirname + '/form.html');
});
apiRouter.route('/survey/:user_id')//routing do poszczególnej ankiety
.get(function(req, res) {// pobiera ankietowanego z tym id
User.findById(req.params.user_id, function(err, user) {
if (err) return res.send(err);
res.json(user);// zwraca go
});
})

.put(function(req, res) {// aktualizuje ankietowanego z danym id
User.findById(req.params.user_id, function(err, user) {
if (err) return res.send(err);

if (req.body.gender) user.gender = req.body.gender;// ustawia nowe odpowiedzi
if (req.body.age) user.age = req.body.age;
if (req.body.fav_beer) user.fav_beer = req.body.fav_beer;
if (req.body.how_many) user.how_many = req.body.how_many;
if (req.body.where) user.where = req.body.where;
if (req.body.with_who) user.with_who = req.body.with_who;
user.save(function(err) {// zapisuje
if (err) return res.send(err);
res.json({ message: 'Ankieta edytowana!' });// zwraca wiadomość
});
});
})

.delete(function(req, res) {// usuwa ankietowanego
User.remove({
_id: req.params.user_id
}, function(err, user) {
if (err) return res.send(err);
res.json({ message: 'Ankieta usunięta!' });
});
});

app.use('/api', apiRouter);// zdefiniowanie ścieżki do API
app.listen(port);//start serwera
console.log('Nasłuchuję na porcie ' + port);