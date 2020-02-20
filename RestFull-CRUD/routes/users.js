

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


router.get('/search/:name', function (req, res, next) {
    sql.connect(config, err => {
    if(err) console.log(err);
    let sqlRequest = new sql.Request();
    sqlRequest.query(`SELECT * FROM [cr-unit-attributes] WHERE Unit = '${req.params.name}'`, (err, result) => {
        if (err) console.log(err);
        console.log(result);
        res.render('dettagli', { unita: result.recordset});
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
        res.render('elenco', { unita: result.recordset});
    });
  });
});
router.get('/inserisci', function (req, res, next) {
    res.render('inserisci');
})
router.get('/elimina', function (req, res, next) {
    res.render('elimina');
})
router.get('/inserito', function (req, res, next) {
    let sqlQuery = `select * from dbo.[cr-unit-attributes] where Unit ='${req.params.name}'`;
    executeQuery(res, sqlQuery, next);
})

router.post('/', function (req, res, next) {
  console.log(req.body);
  let unit = req.body;
  if (!unit) {
    next(createError(400 , "Please provide a correct unit"));
  }
  sql.connect(config, err => {
    let sqlRequest = new sql.Request();
    let sqlInsert = `INSERT INTO dbo.[cr-unit-attributes] (Unit, Cost, Hit_Speed, Count,imageUrl, Range, Transport, Type, Rarity) VALUES ('${unit.Unit}','${unit.Cost}','${unit.Hit_Speed}','${unit.Count}','${unit.imageUrl}','${unit.Range}','${unit.Transport}','${unit.Type}','${unit.Rarity}')`;
    sqlRequest.query(sqlInsert, (error, results) => {
        if (error) throw error;
        sqlRequest.query(`SELECT * FROM [cr-unit-attributes] WHERE Unit = '${unit.Unit}'`, (err, result) => {
            if (err) console.log(err);
            res.render('dettagli', { unita: result.recordset});
        });
    });
  })
});

router.post('/eliminato', function (req, res, next) {
  console.log(req.body);
  let unita = req.body;
  if (!unita) {
    next(createError(400 , "Please provide a correct unit"));
  }
  sql.connect(config, err => {
    let sqlRequest = new sql.Request();
    let sqlDelete = `DELETE FROM dbo.[cr-unit-attributes] WHERE Unit = '${unita.Unit}'`;
    sqlRequest.query(sqlDelete, (error, results) => {
        if (error) throw error;
        sqlRequest.query(`DELETE FROM dbo.[cr-unit-attributes] WHERE Unit = '${unita.Unit}'`, (err, result) => {
            if (err) console.log(err);
            res.render('eliminato');
        });
    });
  })
});
module.exports = router;
