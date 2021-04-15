'use strict'

// C library API
const ffi = require('ffi-napi');

// Express App (Routes)
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');
const mysql = require('mysql2/promise');
let connection;
app.use(fileUpload());
app.use(express.static(path.join(__dirname+'/uploads')));


    let parserlib = ffi.Library("./libgpxparser.so",{
        "GPXfiletoJSON":["string",["string"]],
        "validateGPXFile":["bool",["string","string"]],
        "GPXfileDetailstoJSON":["string",["string"]],
        "gpxDataToJSON":["string",["string","string"]],
        "gpxDataToJSONTracks":["string",["string","string"]],
        "renameRoute":["bool",["string","string","string","string"]],
        "routeDataToJSON":["string",["char","float","float","float","float","float"]],
        "createNewFile":["bool",["string"]],
        "createNewRoute":["string",["string","string","string","int"]],
        "routelistToJSON":["string",["string"]],
        "waypointsToJSON": ["string",["string","string"]]
    });


// Minimization
const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Important, pass in port as in `npm run dev 1234`, do not change
const portNum = process.argv[2];

// Send HTML at root, do not change
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Send Style, do not change
app.get('/style.css',function(req,res){
  //Feel free to change the contents of style.css to prettify your Web app
  res.sendFile(path.join(__dirname+'/public/style.css'));
});

// Send obfuscated JS, do not change
app.get('/index.js',function(req,res){
  fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
    const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
    res.contentType('application/javascript');
    res.send(minimizedContents._obfuscatedCode);
  });
});

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', function(req, res) {
  if(!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
 
  let uploadFile = req.files.uploadFile;
 
  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv('uploads/' + uploadFile.name, function(err) {
    if(err) {
      return res.status(500).send(err);
    }

    res.redirect('/');
  });
});

//Respond to GET requests for files in the uploads/ directory
app.get('/uploads/:name', function(req , res){
  fs.stat('uploads/' + req.params.name, function(err, stat) {
    if(err == null) {
      res.sendFile(path.join(__dirname+'/uploads/' + req.params.name));
    } else {
      console.log('Error in file downloading route: '+err);
      res.send('');
    }
  });
});

//******************** Your code goes here ******************** 

//Sample endpoint
app.get('/endpoint1', function(req , res){
  let retStr = req.query.data1 + " " + req.query.data2;
  res.send(
    {
      somethingElse: retStr
    }
  );
});



app.get('/fileLogDownload', function(req,res){
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var fileLogInfo = [];
  var schemafile = "";
  for(var i =0; i < fileNames.length;i++){
    if(fileNames[i].includes(".xsd") == true){
      schemafile = "./uploads/"+fileNames[i];
      break;
    }
  }
  for(var i = 0; i < fileNames.length;i++){
    var filename = "./uploads/" + fileNames[i];
    if(fileNames[i].includes(".gpx")==true){
      if(parserlib.validateGPXFile( "./uploads/"+fileNames[i],schemafile)==true){
        var json = parserlib.GPXfiletoJSON(filename);
        if(json != "{}"){
          fileLogInfo.push(json);
        }
      }
      }
    }
  console.log(fileLogInfo);
  res.send( fileLogInfo );
});

app.get('/gpxDropdown',function(req,res){
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var schemafile = "";
  console.log("test1");
  for(var i =0; i < fileNames.length;i++){
    if(fileNames[i].includes(".xsd") == true){
      schemafile = "./uploads/"+fileNames[i];
      break;
    }
  }
  console.log("test2");
  var validfiles = [];
  for(var j=0; j< fileNames.length;j++ ){
    if(fileNames[j].includes(".gpx")==true){
      if(parserlib.validateGPXFile( "./uploads/"+fileNames[j],schemafile)==true){
        validfiles.push(fileNames[j]);
      }
    }
  }
  console.log(validfiles);
  res.send(validfiles);
});

app.get('/gpxDropdown2',function(req,res){
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var schemafile = "";
  console.log("test1");
  for(var i =0; i < fileNames.length;i++){
    if(fileNames[i].includes(".xsd") == true){
      schemafile = "./uploads/"+fileNames[i];
      break;
    }
  }
  console.log("test2");
  var validfiles = [];
  for(var j=0; j< fileNames.length;j++ ){
    if(fileNames[j].includes(".gpx")==true){
      if(parserlib.validateGPXFile( "./uploads/"+fileNames[j],schemafile)==true){
        validfiles.push(fileNames[j]);
      }
    }
  }
  console.log(validfiles);
  res.send(validfiles);
});




app.get('/gpxViewTable',function(req,res){
  var fileName = "./uploads/"+req.query.filename;
  var json = parserlib.GPXfileDetailstoJSON(fileName);

  console.log(json.length);
  res.send(json);
});

app.get('/getotherData',function(req,res){
  console.log("thihjdijeje");
  var fileName = "./uploads/"+req.query.filename;
  var name = req.query.componentname;
  console.log("this2"+ fileName + name);
  var json = parserlib.gpxDataToJSON(fileName,name);
 // var json = "";
  console.log("this here hi"+ json);
  res.send(json);
});

app.get('/renameRoute',function(req,res){
  console.log("in rename app");
  var fileName = "./uploads/"+req.query.filename;
  var oldname = req.query.original;
  var newname =  req.query.new;
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var schemafile = "";
  console.log("test1");

 // console.log("this2"+ fileName + name);
 // var json = parserlib.gpxDataToJSON(fileName,name);
  var json = "";
  if(parserlib.renameRoute( fileName,oldname,newname,schemafile)==true){
    json = parserlib.GPXfileDetailstoJSON(fileName);
  }
  
  console.log("rename vals"+ json + fileName + oldname +newname);
  res.send(json);
});

app.get('/getotherDataTracks',function(req,res){
  console.log("thihjdijeje");
  var fileName = "./uploads/"+req.query.filename;
  var name = req.query.componentname;
  console.log("this2"+ fileName + name);
  var json = parserlib.gpxDataToJSONTracks(fileName,name);
 // var json = "";
 var fields = json.split('|');
  console.log("this here hi 2"+ json);
  res.send(fields);
});




app.get('/findPathInfo',function(req,res){
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var schemafile = "";
  var firstlat = req.query.lat1;
  var firstlon = req.query.lon1;
  var seclat = req.query.lat2;
  var seclon = req.query.lon2;
  var del = req.query.delval;
  console.log("test1");
  for(var i =0; i < fileNames.length;i++){
    if(fileNames[i].includes(".xsd") == true){
      schemafile = "./uploads/"+fileNames[i];
      break;
    }
  }
  console.log("test2");
  var validfiles = [];
  for(var j=0; j< fileNames.length;j++ ){
    if(fileNames[j].includes(".gpx")==true){
      if(parserlib.validateGPXFile( "./uploads/"+fileNames[j],schemafile)==true){
        validfiles.push(fileNames[j]);
      }
    }
  }
  var routePaths = [];
  var trackPaths = [];
  var json = [];
  for(var f = 0; f < validfiles.length;f++){
    json.push(parserlib.routeDataToJSON(validfiles[f],firstlat,firstlon,seclat,seclon,del));
   // var track = parserlib.getTracksBetween(validfiles[f],firstlat,firstlon,seclat,seclon);
   // routePaths.push(routes);
   console.log(json);
   // trackPaths.push(tracks);
  }
  console.log(" PAths betwenn   "+ json);
  res.send(routePaths);
});


app.get('/gpxcreatefile', function(req , res){
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var file = './uploads/'+req.query.filename;
  console.log("fileeeeee "+file);
  var newf = "";
  var json = "";
  var flag =0;
  for(var i =0; i < fileNames.length;i++){
    if(("./uploads/"+fileNames[i]) == file){
     flag =1;
    }
    console.log(fileNames[i] );
  }
  if(flag ==0){
    if(parserlib.createNewFile(file)==true){
      var json = parserlib.GPXfiletoJSON(file);
      newf = "true";
    }
  }

  console.log("return: "+json);
  res.send(json);
});


app.get('/sendwaypoint', function(req , res){
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var file = './uploads/'+req.query.filename;
  var lats = req.query.latarray;
  var lons = req.query.lonarray;
  var latlen = req.query.latlength;
  var lonlen = req.query.lonlength;
  var newroute = req.query.routename;
  var routestring = "{\"name\":\"" +newroute+"\"}"; 
  console.log("fileeeeee "+file);
  var open = "[";
  var jsonlatlon = "";
  for(var i = 0; i< latlen;i++){
    jsonlatlon += "{\"lat\":" + lats[i] + ",\"lon\":"+lons[i] + "}";
    if((i+1)!=latlen){
      jsonlatlon+="|";
    }
  }
  var close = "]";
  var final = open + jsonlatlon +close;
  console.log("return: "+jsonlatlon + routestring);
  //final =  parserlib.createNewRoute(jsonlatlon,routestring,file,latlen);
  res.send(JSON.stringify(jsonlatlon));
});


app.get('/sendroute', function(req , res){
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var file = './uploads/'+req.query.filename;
  var lats = req.query.latarray;
  var lons = req.query.lonarray;
  var latlen = req.query.latlength;
  var lonlen = req.query.lonlength;
  var newroute = req.query.routename;
  var routestring = "{\"name\":\"" +newroute+"\"}"; 
  console.log("fileeeeee "+file);
  var open = "[";
  var jsonlatlon =req.query.jsons;
  var close = "]";
  var final = open + jsonlatlon +close;
  console.log("route: "+jsonlatlon + routestring);
  final =  parserlib.createNewRoute(jsonlatlon,routestring,file,latlen);
  res.send(final);
});
/*
app.get('/addRouteFunction',function(req,res){
  var fileName = "./uploads/"+req.query.filename;
  
  console.log();
  res.send();
});
*/

//A4 functions

app.get('/login',async function(req,res){
  try{
    var password = req.query.pw;
    var username = req.query.username;
    var database = req.query.db;
    let dbConf = {
      host     : 'dursley.socs.uoguelph.ca',
      user     : username,
      password : password,
      database : database
    };
    
    connection = await mysql.createConnection(dbConf);
    await connection.execute("CREATE TABLE IF NOT EXISTS FILE(gpx_id INT AUTO_INCREMENT PRIMARY KEY, file_name VARCHAR(60) NOT NULL, ver DECIMAL(2,1) NOT NULL, creator VARCHAR(256) NOT NULL);");
    await connection.execute("CREATE TABLE IF NOT EXISTS ROUTE(route_id INT AUTO_INCREMENT PRIMARY KEY, route_name VARCHAR(256), route_len FLOAT(15,7) NOT NULL, gpx_id INT NOT NULL, FOREIGN KEY(gpx_id) REFERENCES FILE(gpx_id) ON DELETE CASCADE);");
    await connection.execute("CREATE TABLE IF NOT EXISTS POINT(point_id INT AUTO_INCREMENT PRIMARY KEY, point_index INT NOT NULL, latitude DECIMAL(11,7) NOT NULL, longitude DECIMAL(11,7) NOT NULL, point_name VARCHAR(256), route_id INT NOT NULL, FOREIGN KEY (route_id) REFERENCES ROUTE (route_id) ON DELETE CASCADE);");
    const[rows,fields] = await connection.execute("SHOW tables;");
    console.log(rows);
    res.send(true);
  }catch(e){
    res.send(false);
  }
  
});


app.get('/gpxDropdowndatabase',async function(req,res){
  try{
    var filearray = [];
    var [rows,fields] = await connection.execute(`SELECT * FROM FILE ORDER BY file_name;`);
    for(let row of rows){
      filearray.push(row.file_name);
    }
    res.send(filearray);
    
  }catch(e){
    res.send(false);
  }
});

function gpxtosqlTable(creator,version,fn){
  var headers = "(creator, ver, file_name)";
  var values = `(\"${creator}\", ${version}, \"${fn}\")`;
  var sql = `INSERT INTO FILE${headers} VALUES ${values};`;
  return sql;
};

function routetoSQLTable(length, name, foreignkey){
  var header = "(route_len, route_name, gpx_id)";
  var values= `(${length} , \"${name}\", ${foreignkey})`;
  var sql = `INSERT INTO ROUTE ${header} VALUES ${values};`;
  return sql;
};

function waytoSQLTable(index, lat, lon,name, foreignkey){
  var header = "(point_index, latitude, longitude, point_name, route_id)";
  var values= `(${index} ,${lat}, ${lon}, \"${name}\", ${foreignkey})`;
  var sql = `INSERT INTO POINT ${header} VALUES ${values};`;
  return sql;
};


app.get("/addroutetotable", async function(req,res){
  try{
    console.log("hi");
    var fileno = req.query.filename;
    var file = './uploads/'+req.query.filename;

    var newroute = req.query.routename;
    console.log("hi2");
    var [rows,fields] = await connection.execute(`SELECT gpx_id FROM FILE WHERE file_name=\"${fileno}\";`);
    var gpxkey = rows[0].gpx_id;
    console.log("hi3");
  //  console.log("gpxiddd: " + gpxkey);
    var rlist = JSON.parse(parserlib.routelistToJSON("./uploads/"+fileno));
    console.log("hi" + rlist);
    for(var i = 0; i < rlist.length;i++){
        var sql = routetoSQLTable(rlist[i].len,rlist[i].name,gpxkey);
        await connection.execute(sql);
        var route = rlist[i];
        //console.log("route: "+ route.name );
        var way = parserlib.waypointsToJSON("./uploads/"+fileno,route.name);
        var [rows2,fields2] = await connection.execute(`SELECT route_id FROM ROUTE WHERE route_name =\"${route.name}\"`);
        var rtkey = rows2[0].route_id;
        var waylist = JSON.parse(way);
       // console.log("list "+waylist);
        for(var j=0; j<waylist.length;j++){
        //  console.log("in way loop");
          way = waylist[j];
          var waysql = waytoSQLTable(way.index,way.lat,way.lon,way.name,rtkey);
          await connection.execute(waysql);
        }
       // console.log("outside loop");
      }
     
    //var json = parserlib.waypointsToJSON(file,newroute);
    res.send(true);
  }catch(e){
    res.send(false);
  }
  
});

app.get('/populatetables',async function(req,res){
  try{
  await connection.execute("DELETE FROM POINT;");
  await connection.execute("DELETE FROM ROUTE;");
  await connection.execute("DELETE FROM FILE;");

  await connection.execute("ALTER TABLE POINT AUTO_INCREMENT = 1;"); 
  await connection.execute("ALTER TABLE ROUTE AUTO_INCREMENT = 1;"); 
  await connection.execute("ALTER TABLE FILE AUTO_INCREMENT = 1;"); 
  var pathToFiles = path.join(__dirname + '/uploads/');
  var fileNames = fs.readdirSync(pathToFiles);
  var schemafile = "";
  for(var i =0; i < fileNames.length;i++){
    if(fileNames[i].includes(".xsd") == true){
      schemafile = "./uploads/"+fileNames[i];
      break;
    }
  }
  var validfiles = [];
  for(var j=0; j< fileNames.length;j++ ){
    if(fileNames[j].includes(".gpx")==true){
      if(parserlib.validateGPXFile( "./uploads/"+fileNames[j],schemafile)==true){
        validfiles.push(fileNames[j]);
      }
    }
  }
  for(var k =0; k< validfiles.length;k++){
    var json = parserlib.GPXfiletoJSON("./uploads/"+validfiles[k]);
    var obj = JSON.parse(json);
    var creator = obj.creator;
    var version = obj.version;
    var fn = validfiles[k];
    var sql = gpxtosqlTable(creator,version,fn);
    await connection.execute(sql);
    var [rows,fields] = await connection.execute(`SELECT gpx_id FROM FILE WHERE file_name=\"${validfiles[k]}\";`);
    var gpxkey = rows[0].gpx_id;
    console.log("gpxiddd: " + gpxkey);
    var rlist = JSON.parse(parserlib.routelistToJSON("./uploads/"+fn));
    for(var i = 0; i < rlist.length;i++){
      sql = routetoSQLTable(rlist[i].len,rlist[i].name,gpxkey);
      await connection.execute(sql);
      var route = rlist[i];
      console.log("fn: "+ fn );
      console.log("route: "+ route.name );
      var way = parserlib.waypointsToJSON("./uploads/"+fn,route.name);
      var [rows2,fields2] = await connection.execute(`SELECT route_id FROM ROUTE WHERE route_name =\"${route.name}\"`);
      var rtkey = rows2[0].route_id;
      var waylist = JSON.parse(way);
      console.log("list "+way);
      for(var j=0; j<waylist.length;j++){
        console.log("in way loop");
        way = waylist[j];
        var waysql = waytoSQLTable(way.index,way.lat,way.lon,way.name,rtkey);
        await connection.execute(waysql);
      }
     // console.log("outside loop");
    }
  }
  res.send(true);
  }catch(e){
    res.send(false);
}
  //res.send(true);
});

app.get("/cleartables", async function(req,res){
  try{
    await connection.execute("DELETE FROM POINT;");
    await connection.execute("DELETE FROM ROUTE;");
    await connection.execute("DELETE FROM FILE;");
    res.send(true);
  }catch(e){
    res.send(false);
  }
  
});

app.get("/renameupdate", async function(req,res){
  try{
    console.log("yoyoyo");
    var newname = req.query.new2;
    var org = req.query.original;
    console.log("yoyoyooo "+ newname +org);
    var [rows2,fields2] = await connection.execute(`SELECT route_id FROM ROUTE WHERE route_name=\"${org}\";`);
    console.log("rowsfeiels: "+rows2[0].route_id);
    await connection.execute(`UPDATE ROUTE SET route_name =\"${newname}\" WHERE route_id=${rows2[0].route_id};`);
    var [rows3, fields3] = await connection.execute('SELECT * from `ROUTE`');
    for (let row of rows3){
       console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id);
      
   }
    res.send(true);
  }catch(e){
    res.send(false);
  }
 
});

app.get("/displayRoutestoTable", async function(req,res){
  try{
    console.log("in displayyyy");
    var json = "[";
    //var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_name`');
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE`');
    
     for (let row of rows2){
        [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
  
         var filename= rows2[0].file_name;
         console.log("FILEEEEE "+filename);
         console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
         json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
        /* if(row+1 != NULL){
            json+=",";
         }*/
     }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     //await connection.execute("CREATE VIEW ROUTE2 (route_id, route_name, route_len, gpx_id) AS SELECT route_id, route_name, route_len, gpx_id FROM ROUTE WHERE route_len < 10000;");
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });


 app.get("/displayRoutestoTableSorted", async function(req,res){
  try{
   // await connection.execute("SHOW TABLES;");
  /*  const[rows,fields] = await connection.execute("SELECT * FROM ROUTE;");
    for(row in rows){
      console.log(row);
    }
    */
    console.log("in displayyyy");
    var json = "[";
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_name`');
    //var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE`');
     for (let row of rows2){
      [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
  
      var filename= rows2[0].file_name;
      console.log("FILEEEEE "+filename);
      console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
      json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
     }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     //await connection.execute("CREATE VIEW ROUTE2 (route_id, route_name, route_len, gpx_id) AS SELECT route_id, route_name, route_len, gpx_id FROM ROUTE WHERE route_len < 10000;");
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });

 app.get("/displayRoutestoTablelensort", async function(req,res){
  try{
    console.log("in displayyyy22");
    var json = "[";
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len`');
    //var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE`');
     for (let row of rows2){
      [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
  
      var filename= rows2[0].file_name;
      console.log("FILEEEEE "+filename);
      console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
      json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
     }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     //await connection.execute("CREATE VIEW ROUTE2 (route_id, route_name, route_len, gpx_id) AS SELECT route_id, route_name, route_len, gpx_id FROM ROUTE WHERE route_len < 10000;");
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });


app.get("/displaytables", async function(req,res){
  try{
    var countobj = {n1:-1,n2:-1,n3:-1};
    var [rows,fields] = await connection.execute(`SELECT COUNT(*) AS num FROM FILE;`);
    console.log(rows[0]);
    countobj.n1 = rows[0].num;
     [rows,fields] = await connection.execute(`SELECT COUNT(*) AS num FROM ROUTE;`);
    countobj.n2 = rows[0].num;
     [rows,fields] = await connection.execute(`SELECT COUNT(*) AS num FROM POINT;`);
    countobj.n3 = rows[0].num;
    if(countobj.n1 == -1 || countobj.n2 == -1 || countobj.n3 == -1  ){
      res.send(false);
    }else{
      res.send(countobj);
    }
  }catch(e){
    res.send(false);
  }
 
});

//display query 2 stuff

app.get("/displayRoutestoTable2", async function(req,res){
  try{
    console.log("in displayyyy");
    var file = req.query.file;
    var json = "[";
    //var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_name`');
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE`');
    
     for (let row of rows2){
        [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
  
         var filename= rows2[0].file_name;
         console.log("FILEEEEE "+filename);
         if(filename == file){
          console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
          json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
         }
     }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     //await connection.execute("CREATE VIEW ROUTE2 (route_id, route_name, route_len, gpx_id) AS SELECT route_id, route_name, route_len, gpx_id FROM ROUTE WHERE route_len < 10000;");
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });


 app.get("/displayRoutestoTableSorted2", async function(req,res){
  try{
    var file = req.query.file;
    console.log("in displayyyy");
    var json = "[";
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_name`');
     for (let row of rows2){
      [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
      var filename= rows2[0].file_name;
      console.log("FILEEEEE "+filename +"file "+file);
      if(filename == file){
        var routename2 = row.route_name;
        if(row.route_name == "None"){
          routename2 = "unamed"+counter;
        }
        console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
        json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
      }
      
     }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });

 app.get("/displayRoutestoTablelensort2", async function(req,res){
  try{
    var file = req.query.file;
    console.log("in displayyyy22");
    var json = "[";
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len`');
     for (let row of rows2){
      [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
      var filename= rows2[0].file_name;
      console.log("FILEEEEE "+filename);
      if(filename == file){
        
        console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
        json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
      }
      }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });

 /*
  <th> Route Name </th>
                    <th> Point Index </th>
                    <th> Latitude </th>
                    <th> Longitude </th>
                    <th> Point Name </th>*/ 
 app.get("/displaypointtosql", async function(req,res){
  try{
    var route = req.query.rt;
    console.log("in displayyyy3");
    var json = "[";
    var [rows2, fields2] = await connection.execute(`SELECT route_id from ROUTE WHERE route_name=\"${route}\"`);
    console.log("routeee: "+rows2[0].route_id);
    var [rows7, fields7] = await connection.execute(`SELECT route_len from ROUTE WHERE route_name=\"${route}\"`);
    var [rows3, fields3] = await connection.execute(`SELECT * from POINT ORDER BY point_index`);
    console.log("made it here");
     for (let row of rows3){
       if(row.route_id == rows2[0].route_id){
        console.log("ID: "+route+" Last name: "+row.point_index+" len: "+row.latitude+" mark: "+row.longitude +"filename : " +row.point_name);
        json += ("{\"Rname\":\""+route+"\",\"rlen\":"+rows7[0].route_len+",\"index\":"+row.point_index+",\"lat\":"+row.latitude+",\"lon\":"+row.longitude+",\"pname\":\""+row.point_name+"\"}," );
       }
      
      }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });

/*if(row.gpx_id == rows[0].gpx_id){
        console.log("ID: "+row.route_name+" Last name: "+row.point_index+" len: "+row.latitude+" mark: "+row.longitude +"filename : " +row.point_name);
        json += ("{\"Rname\":\""+row.route_name+"\",\"rlen\":"+rows7[0].route_len+",\"index\":"+row.point_index+",\"lat\":"+row.latitude+",\"lon\":"+row.longitude+",\"pname\":\""+row.point_name+"\"}," );
      } */

 
 app.get("/displaypointstoTableSorted", async function(req,res){
  try{
    var file = req.query.file;
    console.log("in displayyyy5 " +file);
    var json = "[";
    var counter =1;
    var [rows,fields] = await connection.execute(`SELECT gpx_id FROM FILE WHERE file_name=\"${file}\";`);
    console.log("gpx: "+rows[0].gpx_id);
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE`  ORDER BY route_name');
     for (let row of rows2){
      if(row.gpx_id == rows[0].gpx_id){
        var [rows8, fields8] = await connection.execute(`SELECT route_id from ROUTE WHERE gpx_id=${rows[0].gpx_id}`);
        var [rows3, fields3] = await connection.execute(`SELECT * from POINT ORDER BY point_index`);
        for (let roww of rows3){
          if(roww.route_id == rows8[0].route_id){
            var routename2 = row.route_name;
            if(row.route_name == "\"None\""){
              routename2 = "unamedroute"+counter;
              counter+=1;
            }
          console.log("ID: "+routename2+" Last name: "+roww.point_index+" len: "+roww.latitude+" mark: "+roww.longitude +"filename : " +roww.point_name);
          json += ("{\"Rname\":\""+routename2+"\",\"rlen\":"+row.route_len+",\"index\":"+roww.point_index+",\"lat\":"+roww.latitude+",\"lon\":"+roww.longitude+",\"pname\":\""+roww.point_name+"\"}," );  
        }
      }
      }
    }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });

  
 app.get("/displaypointstoTableSortedlen", async function(req,res){
  try{
    var file = req.query.file;
    console.log("in displayyyy5 " +file);
    var json = "[";
    var counter=1;
    var [rows,fields] = await connection.execute(`SELECT gpx_id FROM FILE WHERE file_name=\"${file}\";`);
    console.log("gpx: "+rows[0].gpx_id);
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE`  ORDER BY route_len');
     for (let row of rows2){
      if(row.gpx_id == rows[0].gpx_id){
        var [rows8, fields8] = await connection.execute(`SELECT route_id from ROUTE WHERE gpx_id=${rows[0].gpx_id}`);
        var [rows3, fields3] = await connection.execute(`SELECT * from POINT ORDER BY point_index`);
        for (let roww of rows3){
          if(roww.route_id == rows8[0].route_id){
            var routename2 = row.route_name;
            if(row.route_name == "\"None\""){
              routename2 = "unamedroute"+counter;
              counter+=1;
            }
          console.log("ID: "+routename2+" Last name: "+roww.point_index+" len: "+roww.latitude+" mark: "+roww.longitude +"filename : " +roww.point_name);
          json += ("{\"Rname\":\""+routename2+"\",\"rlen\":"+row.route_len+",\"index\":"+roww.point_index+",\"lat\":"+roww.latitude+",\"lon\":"+roww.longitude+",\"pname\":\""+roww.point_name+"\"}," );  
        }
      }
      }
    }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });

  
 app.get("/displaypointsq4", async function(req,res){
  try{
    var file = req.query.file;
    console.log("in displayyyy5 " +file);
    var json = "[";
    var counter=1;
    var [rows,fields] = await connection.execute(`SELECT gpx_id FROM FILE WHERE file_name=\"${file}\";`);
    console.log("gpx: "+rows[0].gpx_id);
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE`');
     for (let row of rows2){
      if(row.gpx_id == rows[0].gpx_id){
        var [rows8, fields8] = await connection.execute(`SELECT route_id from ROUTE WHERE gpx_id=${rows[0].gpx_id}`);
        var [rows3, fields3] = await connection.execute(`SELECT * from POINT ORDER BY point_index`);
        for (let roww of rows3){
          if(roww.route_id == rows8[0].route_id){
            var routename2 = row.route_name;
            if(row.route_name == "\"None\""){
              routename2 = "unamedroute"+counter;
              counter+=1;
            }
          console.log("ID: "+routename2+" Last name: "+roww.point_index+" len: "+roww.latitude+" mark: "+roww.longitude +"filename : " +roww.point_name);
          json += ("{\"Rname\":\""+routename2+"\",\"rlen\":"+row.route_len+",\"index\":"+roww.point_index+",\"lat\":"+roww.latitude+",\"lon\":"+roww.longitude+",\"pname\":\""+roww.point_name+"\"}," );  
        }
      }
      }
    }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });
 

 app.get("/displayq5name", async function(req,res){
  try{
    var file = req.query.file;
    var n = req.query.nval;
    var ls = req.query.ls;
    console.log("in displayyyy22");
    var json = "[";
    var counter =0;
    var routearr = [];
    if(ls=="S"){
     var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len`');
     // var [rows2, fields2] = await connection.execute(`SELECT * FROM ( SELECT * FROM ROUTE ORDER BY route_name) AS num LIMIT ${n} ORDER BY route_len;`);
      for (let row of rows2){
        [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
        var filename= rows2[0].file_name;
        console.log("FILEEEEE "+filename);
        if(filename == file && counter < n){
          routearr.push(row.route_id);
          counter+=1;
          console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
          //json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
        }
      }
      var [rowsn,fieldsn] = await connection.execute(`SELECT * FROM ROUTE ORDER BY route_name`);
      for(let row of rowsn){
          for(var i = 0;i<routearr.length;i++){
            if(row.route_id == routearr[i]){
              [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
              var filename= rows2[0].file_name;
              console.log("FILEEEEE "+filename);
              json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
            }
          }
      }
    }else{
      var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len` DESC');
     // var [rows2, fields2] = await connection.execute(`SELECT * FROM ( SELECT * FROM ROUTE ORDER BY route_name) AS num LIMIT ${n} ORDER BY route_len;`);
      for (let row of rows2){
        [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
        var filename= rows2[0].file_name;
        console.log("FILEEEEE "+filename);
        if(filename == file && counter < n){
          routearr.push(row.route_id);
          counter+=1;
         // console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
          //json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
        }
      }
      var [rowsn,fieldsn] = await connection.execute(`SELECT * FROM ROUTE ORDER BY route_name`);
      for(let row of rowsn){
          for(var i = 0;i<routearr.length;i++){
            if(row.route_id == routearr[i]){
              [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
              var filename= rows2[0].file_name;
              //console.log("FILEEEEE "+filename);
              json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
            }
          }
      }
    }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });
 
 app.get("/displayq5len", async function(req,res){
  try{
    var file = req.query.file;
    var n = req.query.nval;
    var ls = req.query.ls;
    console.log("in displayyyy22");
    var json = "[";
    var counter =0;
    var routearr = [];
    if(ls=="S"){
     var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len`');
     // var [rows2, fields2] = await connection.execute(`SELECT * FROM ( SELECT * FROM ROUTE ORDER BY route_name) AS num LIMIT ${n} ORDER BY route_len;`);
      for (let row of rows2){
        [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
        var filename= rows2[0].file_name;
        console.log("FILEEEEE "+filename);
        if(filename == file && counter < n){
          routearr.push(row.route_id);
          counter+=1;
         // console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
          //json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
        }
      }
      var [rowsn,fieldsn] = await connection.execute(`SELECT * FROM ROUTE ORDER BY route_len`);
      for(let row of rowsn){
          for(var i = 0;i<routearr.length;i++){
            if(row.route_id == routearr[i]){
              [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
              var filename= rows2[0].file_name;
              //console.log("FILEEEEE "+filename);
              json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
            }
          }
      }
    }else{
      var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len` DESC');
     // var [rows2, fields2] = await connection.execute(`SELECT * FROM ( SELECT * FROM ROUTE ORDER BY route_name) AS num LIMIT ${n} ORDER BY route_len;`);
      for (let row of rows2){
        [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
        var filename= rows2[0].file_name;
        console.log("FILEEEEE "+filename);
        if(filename == file && counter < n){
          routearr.push(row.route_id);
          counter+=1;
         // console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
          //json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
        }
      }
      var [rowsn,fieldsn] = await connection.execute(`SELECT * FROM ROUTE ORDER BY route_len`);
      for(let row of rowsn){
          for(var i = 0;i<routearr.length;i++){
            if(row.route_id == routearr[i]){
              [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
              var filename= rows2[0].file_name;
             // console.log("FILEEEEE "+filename);
              json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
            }
          }
      }
    }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });
 
 app.get("/displayq5", async function(req,res){
  try{
    var file = req.query.file;
    var n = req.query.nval;
    var ls = req.query.ls;
    console.log("in displayyyy22");
    var json = "[";
    var counter =0;
    if(ls=="S"){
    var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len`');
     for (let row of rows2){
      [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
      var filename= rows2[0].file_name;
      console.log("FILEEEEE "+filename);
      if(filename == file && counter < n){
        counter+=1;
        console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
        json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
      }
      
      }
    }else{
      var [rows2, fields2] = await connection.execute('SELECT * from `ROUTE` ORDER BY `route_len` DESC');
     for (let row of rows2){
      [rows2,fields2] = await connection.execute(`SELECT file_name FROM FILE WHERE gpx_id=${row.gpx_id};`);
      var filename= rows2[0].file_name;
      console.log("FILEEEEE "+filename);
      if(filename == file && counter < n){
        counter+=1;
        console.log("ID: "+row.route_id+" Last name: "+row.route_name+" len: "+row.route_len+" mark: "+row.gpx_id +"filename : " +filename);
        json += ("{\"ID\":\""+row.route_id+"\",\"name\":\""+row.route_name+"\",\"len\":"+row.route_len+",\"gpx\":"+row.gpx_id+",\"filename\":\""+filename+"\"}," );
      }
      
      
      }
    }
     var text = json.slice(0, -1);
     text+="]";
     if(text=="]"){
      text="[]";
     }
     console.log("Table: "+ text);
     res.send(text);
  }catch(e){
    res.send(false);
  }
 });


// leave at bottom
app.listen(portNum);
console.log('Running app at localhost: ' + portNum);

