var express = require('express');
var router = express.Router();
var cors = require('cors')
const sql = require('mssql')
var app = express()
app.use(cors())

const config = {
  user: 'bissoli.marco',  //Vostro user name
  password: 'xxx123#', //Vostra password
  server: "213.140.22.237",  //Stringa di connessione
  
}
//Function to connect to database and execute query
let executeQuery = function (res, query, next) {
  sql.connect(config, function (err) {
    if (err) { //Display error page
      console.log("Error while connecting database :- " + err);
      res.status(500).json({success: false, message:'Error while connecting database', error:err});
      return;
    }
    var request = new sql.Request(); // create Request object
    request.query(query, function (err, result) { //Display error page
      if (err) {
        console.log("Error while querying database :- " + err);
        res.status(500).json({success: false, message:'Error while querying database', error:err});
        sql.close();
        return;
      }
      res.send(result.recordset); //Il vettore con i dati è nel campo recordset (puoi loggare result per verificare)
      sql.close();
    });

  });
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  let sqlQuery = "select * from dbo.[cr-unit-attributes]";
  executeQuery(res, sqlQuery, next);
});

router.get('/search/:name', function (req, res, next) {
    sql.connect(config, err => {
    if(err) console.log(err);
    let sqlRequest = new sql.Request();
    sqlRequest.query(`SELECT * FROM [cr-unit-attributes] WHERE Unit = '${req.params.name}'`, (err, result) => {
        if (err) console.log(err);
        console.log(result);
        res.render('dettagli', { unita: result.recordsets[0][0] });
    });
  });
});
router.get('/elenco', function (req, res, next) {
    sql.connect(config, err => {
    if(err) console.log(err);
    let sqlRequest = new sql.Request();
    sqlRequest.query(`SELECT * FROM [cr-unit-attributes]`, (err, result) => {
        if (err) console.log(err);
        console.log(result);
        res.render('elenco', { unita: result.recordsets[0] });
    });
  });
});
router.get('/inserisci', function (req, res, next) {
    res.render('index');
})
router.get('/inserito', function (req, res, next) {
    let sqlQuery = `select * from dbo.[cr-unit-attributes] where Unit ='${req.params.name}'`;
    executeQuery(res, sqlQuery, next);
})

router.post('/', function (req, res, next) {
  // Add a new Unit  
  let unit = req.body;
  if (!unit) {  //Qui dovremmo testare tutti i campi della richiesta
    res.status(500).json({success: false, message:'Error while connecting database', error:err});
    return;
  }
  let sqlInsert = `INSERT INTO dbo.[cr-unit-attributes] (Unit,Cost,Hit_Speed) 
                     VALUES ('${unit.Unit}','${unit.Cost}','${unit.Hit_Speed}')`;
  executeQuery(res, sqlInsert, next);
  res.send({success:true, message: "unità inserita con successo", unit: unit})
});

module.exports = router;
