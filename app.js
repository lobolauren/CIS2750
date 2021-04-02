'use strict'

// C library API
const ffi = require('ffi-napi');

// Express App (Routes)
const express = require("express");
const app     = express();
const path    = require("path");
const fileUpload = require('express-fileupload');

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
        "createNewRoute":["string",["string","string","string","int"]]
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
  for(var i = 0; i < fileNames.length;i++){
    var filename = "./uploads/" + fileNames[i];
    if(fileNames[i].includes(".gpx")==true){
        var json = parserlib.GPXfiletoJSON(filename);
        if(json != "{}"){
          fileLogInfo.push(json);
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
    json = parserlib.GPXfiletoJSON(fileName);
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

app.get('/addRouteFunction',function(req,res){
  var fileName = "./uploads/"+req.query.filename;
  
  console.log();
  res.send();
});
// leave at bottom
app.listen(portNum);
console.log('Running app at localhost: ' + portNum);

