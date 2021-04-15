
let gpxViewFile = "";
let addRouteFile = "";
let viewroutesFile ="";
let q5file ="";
let jsonlatlonstring ="";
let overname ="";
let viewpointsfile ="";
let compnum2 = [];
let waypointlon = [];
let waypointlat = [];
//HELPER FUNCTIONS



function JSONtoFileLogRow(json){
    console.log("inside");
    var obj = JSON.parse(json);
    console.log("after");
    var fn = obj.fileName;
    var version = obj.version;
    var creator = obj.creator;
    var way = obj.numWaypoints;
    var routes = obj.numRoutes;
    var tracks = obj.numTracks;
    console.log("here");
    var html = "<tr><td><a href="+fn+" download>"+fn.replace("./uploads/","")+"</a></td>" + "<td>" + version.toString() 
                + "</td>" + "<td>" + creator + "</td>" + "<td>" + way.toString() + "</td>"
                + "<td>" + routes.toString() + "</td>" + "<td>" +tracks.toString() + "</td></tr>"; 
        console.log(html);
         return html;
}
// sprintf(json,"{\"compnum\":\"%s\",\"name\":\"%s\",\"numPoints\":%d,\"len\":%.1f,\"loop\":%s}",array,namestr,x,round10(getTrackLen(rt)),loopstr);
function JSONtoViewRow(json){
    var obj = JSON.parse(JSON.stringify(json));
    var compnum = obj.compnum;
    var name = obj.name;
    compnum2.push(compnum + ":"+obj.name);
    var numpoints = obj.numPoints.toString();
    var len = obj.len.toString();
    var loop = obj.loop.toString();
    var html = "<tr><td><a href=\"#\" class=\"otherDataLink\">"+compnum+"</a></td>" + "<td>" + name 
                + "</td>" + "<td>" + numpoints + "</td>" + "<td>" + len+ "</td>"
                + "<td>" +loop + "</td></tr>"; 
   // compname.push(html);
   // console.log("yo" + compname);
    return html;
}

function JSONtoSQL(json){
    var obj = JSON.parse(JSON.stringify(json));
    var rID = obj.ID;
    var name = obj.name;
    //compnum2.push(compnum + ":"+obj.name);
   // var len = obj.len.toString();
    var len = obj.len.toString();
    var gpxID = obj.gpx.toString();
    var file = obj.filename;
    var html = "<tr><td>"+file+"</td>"+"<td>"+rID+"</td>" + "<td>" + name 
                + "</td>" + "<td>" + len + "</td>" 
                + "<td>" +gpxID + "</td></tr>"; 
   // compname.push(html);
   // console.log("yo" + compname);
    return html;
}
function JSONtopointsSQL(json){
    var obj = JSON.parse(JSON.stringify(json));
    var rname = obj.Rname;
    var index = obj.index.toString();
    var len = obj.rlen.toString();
    //compnum2.push(compnum + ":"+obj.name);
   // var len = obj.len.toString();
    var lat = obj.lat.toString();
    var lon = obj.lon.toString();
    var pname = obj.pname;
    var html = "<tr><td>"+rname+"</td>"+"<td>"+len+"</td>" +"<td>"+index+"</td>" + "<td>" + lat 
                + "</td>" + "<td>" + lon + "</td>" 
                + "<td>" +pname + "</td></tr>"; 
   // compname.push(html);
   // console.log("yo" + compname);
    return html;
}

function JSONtoDataHtml(json){
    console.log("insidemmmm");
    var obj = JSON.parse(JSON.stringify(json));
    var name = obj.name;
    var value = obj.value;
    var html = name +"  " + value; 
    console.log("yo" + html);
    return html;
}
function JSONtoDataHtmlTrack(json){
    console.log("insidemmmm");
    var obj = JSON.parse(json);
    var name = obj.name;
    var value = obj.value;
    var html = name +"  " + value; 
    console.log("yo" + html);
    return html;
}

function otherdataToHTML(json){
    var html = "<script> alert(\"" + JSONtoDataHtml(json).toString() + "\");</script>";
    console.log(html);
    return html;
}

function buttonFunction() {
    console.log("hello");
    console.log(document.getElementsByClassName("dropdown-content"));
  }
// Put all onload AJAX calls here, and event listeners

jQuery(document).ready(function() {
    // On page-load AJAX Example
    jQuery.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/endpoint1',   //The server endpoint we are connecting to
        data: {
            data1: "Value 1",
            data2:1234.56
        },
        success: function (data) {
            /*  Do something with returned object
                Note that what we get is an object, not a string, 
                so we do not need to parse it on the server.
                JavaScript really does handle JSONs seamlessly
            */
            jQuery('#blah').html("On page load, received string '"+data.somethingElse+"' from server");
            //We write the object to the console to show that the request was successful
            console.log(data); 

        },
        fail: function(error) {
            // Non-200 return, do something with error
            $('#blah').html("On page load, received error from server");
            console.log(error); 
        }
    });

    jQuery.ajax({

        type: 'get',
        dataType: 'json',
        url: '/fileLogDownload',
        success: function(data){
            //append data to file log panel, 
            if(data.length ==0){
                alert("No current files! Upload files to view in Log Panel.");
            }
            for(var i = 0; i < data.length ;i++){
                console.log(data[i]);
                $('#filelogtable').find('tbody').append(JSONtoFileLogRow(data[i]));
            }
        },
        fail:function(error){
            //if console fails
        }
    });

    jQuery.ajax({
        type: 'get',
        dataType: 'json',
        url: '/gpxDropdown',
        success:function(data){
            //appending to dropdown menu
            console.log("test before");
            for(var i =0; i<data.length;i++){
                $('#gpxViewDropdown').append("<a class=\"filesTag\" href=\"#\" >" +data[i].replace("./uploads/","")+"</a>");

            }
            console.log("test after");
        },
        
        fail:function(error){
            //if fails
        }
    });

    $(document).on('click','.filesTag',function(){
        compnum2 = [];
         $('#gpxviewtable').find('tbody').empty();
         gpxViewFile = $(this).text().toString();
         jQuery.ajax({
            type: 'get',
            dataType: 'json',
            url: '/gpxViewTable',
            data:{
                filename: gpxViewFile
            },
            success: function(data){
                //append data to gpx view panel, 
                console.log("lennnngth" + data.length);
                if(data.length ==0){
                    alert("No Routes or Tracks to Add!");
                }
                for(var i = 0; i < data.length ;i++){
                console.log(data[i]);
                    $('#gpxviewtable').find('tbody').append(JSONtoViewRow(data[i]));
                }
            },
            fail:function(error){
                //if console fails
                console.log("error table");
            }
        });
    });

     $(document).on('click','.otherDataLink',function(){
        var route= $(this).text().toString();
        console.log("route" + route);
       var compname ="";
        for(var j = 0; j < compnum2.length;j++){
            console.log("inloop");
            var fields = compnum2[j].split(":");  
            if(fields[0] == route){
               // var fields = compnum2[j].split(":");  
                console.log("hereeeee222: "+ fields); 
                compname = fields[1];
            }
        }
        var urlval = ''; 
        var flag=0;
        if(route.includes("Route") == true){
            urlval = '/getotherData';
            flag=1;
        }else{
            urlval= '/getotherDataTracks'
        }
        console.log("hereeeee: "+ compname);
        jQuery.ajax({
            type: 'get',
            dataType: 'json',
            url: urlval,
            data:{
                filename: gpxViewFile,
                componentname: compname
            },
            success: function(data){
                console.log("data" + data);
               // $('#alertbox').find('script').append(otherdataToHTML(data));
                if(data == ""){
                    alert("No Other Data");
                }else{
                    if(flag ==1){
                        alert("Other Data\n"+JSONtoDataHtml(data));
                       }else{
                           for(var i =0; i<data.length;i++){
                            alert("Other Data\n"+JSONtoDataHtmlTrack(data[i]));
                           }
                       }
                }
               // alert(JSONtoDataHtml(data));
            },
            fail:function(error){
                //iffails
                console.log("failed.");
            }
     });
    });
       
    jQuery.ajax({
        type: 'get',
        dataType: 'json',
        url: '/gpxDropdown2',
        success:function(data){
            //appending to dropdown menu
         //   console.log("test before2");
            for(var i =0; i<data.length;i++){
                $('#routeviewDropdown2').append("<a class=\"filesTag2\" href=\"#\" >" +data[i].replace("./uploads/","")+"</a>");
              //  console.log("second: " + data[i]);
            }
           // console.log("test after2");
        },
        
        fail:function(error){
            //if fails
        }
    });
    // Event listener form example , we can use this instead explicitly listening for events
    // No redirects if possible

    $(document).on('click','#sendRoutename',function(){
     //   e.preventDefault();
        var ogName = '';
        var newName = '';
        ogName =  $('#fname1').val();
        newName = $('#lname1').val();
        overname = $('#lname1').val();
        console.log("heyyyyyyyyyyyyyyyy: " +ogName + newName);
        jQuery.ajax({
            type: 'get',
            dataType: 'text',
            url: '/renameRoute',
            data:{
                filename: gpxViewFile,
                original: ogName,
                new: newName
            },
            success: function(data){
                console.log("datarenamee" + data);
                alert("Please reselect the filename to see the new changes!");
                var ogName = '';
                var newName = '';
                ogName =  $('#fname1').val();
                newName = $('#lname1').val();
                jQuery.ajax({
                    type:'get',
                    dataType:'json',
                    url:'/renameupdate',
                    data:{
                        filename: gpxViewFile,
                        original: ogName,
                        new2: overname
                    },
                    success:function(data){
                        jQuery.ajax({
                            type:'get',
                            dataType:'json',
                            url:'/displaytables',
                            success:function(data){
                                if(data==false){
                                    alert("Failed to display status");
                                }else{
                                    alert(`"Database has ${data.n1} files, ${data.n2} routes, and ${data.n3} points`);
                                }
                            },
                            fail:function(error){

                            }
                        });
                    },
                    fail:function(error){
                      //  alert("Failed to Store Tables");
                    }
                });
                $('#gpxviewtable').find('tbody').append(JSONtoViewRow(data));
               // alert(JSONtoDataHtml(data));
            },
            fail:function(error){
                //iffails
                console.log("failed send RouteName.");
            }
     });
    });


    $(document).on("click","#gpxnewfile",function(e){
        e.preventDefault();
        var gpxfile = '';
        gpxfile =  $('#gpxfile1').val();
       // console.log("heyyyyyyyyyyyyyyyy: " +ogName + newName);
        jQuery.ajax({
            type: 'get',
            dataType: 'text',
            url: '/gpxcreatefile',
            data:{
                filename: gpxfile
            },
            success: function(data){
                    if(data != ""){
                        $('#filelogtable').find('tbody').append(JSONtoFileLogRow(data));
                        $('#gpxViewDropdown').append("<a class=\"filesTag\" href=\"#\" >" +gpxfile+"</a>");
                        $('#routeviewDropdown2').append("<a class=\"filesTag2\" href=\"#\" >" +gpxfile+"</a>");
                        alert("New File Created!");
                    }
                   
            },
            fail:function(error){
                //iffails
                console.log("failed send new gpxfile.");
            }
     });
    });
    
    $('#sendfindpath').click(function(){
        var startlat = '';
        var startlon = '';
        startlat =  $('#lat1').val();
        startlon =  $('#lon1').val();
        var endlat = '';
        var endlon = '';
        endlat =  $('#lat2').val();
        endlon =  $('#lon2').val();
        var delta ='';
        delta =  $('#delta').val();
        console.log("nummmmms" + startlon + startlat +endlon +endlat+delta);
        jQuery.ajax({
            type: 'get',
            dataType: 'json',
            url: '/findPathInfo',
            data:{
                lat1:startlat,
                lon1:startlon,
                lon2:endlon,
                lat2:endlat,
                delval:delta
            },
            success: function(data){
                console.log("data" + data);
                for(var i =0; i< data.length;i++){
                    $('#gpxfindpathtable').find('tbody').append(JSONtoViewRow(data[i]));
                }
            },
            fail:function(error){
                //iffails
                console.log("failed find path.");
            }
     });
    });

    
    $(document).on('click','.filesTag2',function(){
        waypointlat = [];
        waypointlon = [];
        addRouteFile = $(this).text().toString();
        alert("File: " + addRouteFile+" selected.");
    });

    $('#sendwaypointinfo').click(function(){
        var startlat2 = '';
        var startlon2 = '';
        if(addRouteFile == ""){
            alert("No File Selected!");
        }
        var route = $('#newroute22').val();
        if(parseFloat($('#waylat1').val()) && parseFloat($('#waylon1').val())){
            
            startlat2 =  $('#waylat1').val();
            startlon2 =  $('#waylon1').val();
            if(((startlat2 > -90.00) && (startlat2 < 90.00)) && ((startlon2 < 180.00) && (startlon2 > -180.00)) ){
                waypointlat.push(startlat2);
                waypointlon.push(startlon2);
            }else{
                alert("Invalid Input: lat(-90.00 -> 90.00) and lon (-180.00 -> 180.00)");
            }
        
        }else{
            alert("Invalid Input: lat(-90.00 -> 90.00) and lon (-180.00 -> 180.00)");
        }
        var latlen = waypointlat.length;
        var lonlen = waypointlon.length;
        console.log("arrays" +route +" "+ waypointlat + waypointlon );
        jQuery.ajax({
            type: 'get',
            dataType: 'json',
            url: '/sendwaypoint',
            data:{
                lat1:startlat2,
                lon1:startlon2,
                filename:addRouteFile,
                latarray:waypointlat,
                lonarray:waypointlon,
                latlength:latlen,
                lonlength: lonlen,
                routename:route
            },
            success: function(data){
               jsonlatlonstring = data;
               console.log("THISTHEONE" + jsonlatlonstring);
               alert("Waypoint Added!");
            },
            fail:function(error){
                //iffails
                console.log("failed find path.");
            }
     });
    });
    $(document).on("click","#sendAddRouteInfo",function(e){
        e.preventDefault();
        var route = $('#newroute22').val();
        var latlen = waypointlat.length;
        var lonlen = waypointlon.length;
        console.log("arrays" +route +" "+ waypointlat + waypointlon );
        jQuery.ajax({
            type: 'get',
            dataType: 'json',
            url: '/sendroute',
            data:{
                filename:addRouteFile,
                latarray:waypointlat,
                lonarray:waypointlon,
                latlength:latlen,
                lonlength: lonlen,
                routename:route,
                jsons:jsonlatlonstring
            },
            success: function(data){
                
                $('#filelogtable').find('tbody').append(JSONtoFileLogRow(data));
            },
            fail:function(error){
                //iffails
                console.log("failed find path.");
            }
     });
    });
    $(document).on("click","#sendAddRouteInfo",function(e){
        jQuery.ajax({
            type: 'get',
            dataType: 'json',
            url: '/addroutetotable',
            data:{
                filename:addRouteFile,
            },
            success: function(data){
                alert("Route Added!");
                jQuery.ajax({
                    type:'get',
                    dataType:'json',
                    url:'/displaytables',
                    success:function(data){
                        if(data==false){
                            alert("Failed to display status");
                        }else{
                            alert(`"Database has ${data.n1} files, ${data.n2} routes, and ${data.n3} points`);
                        }
                    },
                    fail:function(error){
        
                    }
                });
              //  $('#filelogtable').find('tbody').append(JSONtoFileLogRow(data));

            },
            fail:function(error){
                //iffails
                console.log("failed find path.");
            }
     });

    });

    
  
    //A4 functionality

    $(document).on("click","#loginbutton",function(e){
        e.preventDefault();
        var username = $("#loginid").val();
        var password = $("#passwordid").val();
        var database = $("#databaseid").val();
        $("#routeviewDropdown").empty();
        $("#routeviewDropdown4").empty();
        $("#routeviewDropdown5").empty();
        jQuery.ajax({
            type: 'get',
            dataType:'json',
            url:'/login',
            data:{
                username:username,
                pw:password,
                db:database
            },
            success:function(data){
                if(data ==true){
                    alert("Successfully connected to database!");
                    jQuery.ajax({
                        type:'get',
                        dataType:'json',
                        url:'/displaytables',
                        success:function(data){
                            if(data==false){
                                alert("Failed to display status");
                            }else{
                                alert(`"Database has ${data.n1} files, ${data.n2} routes, and ${data.n3} points`);
                                jQuery.ajax({
                                    type: 'get',
                                    dataType: 'json',
                                    url: '/gpxDropdowndatabase',
                                    success:function(data){
                                        //appending to dropdown menu
                                     //   console.log("test before2");
                                        for(var i =0; i<data.length;i++){
                                            $('#routeviewDropdown').append("<option class=\"filesTag3\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
                                            $('#routeviewDropdown4').append("<option class=\"filesTag4\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
                                            $('#routeviewDropdown5').append("<option class=\"filesTag5\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
                                            //  console.log("second: " + data[i]);
                                        }
                                       // console.log("test after2");
                                    },
                                    
                                    fail:function(error){
                                        //if fails
                                    }
                                });      
                            }
                        },
                        fail:function(error){
            
                        }
                    });
                }else{
                    alert("Failed to connect to database");
                }
            },
            fail:function(error){

            }
        });
    });

    $(document).on("click","#storeallfilesbutton",function(e){
        e.preventDefault();
        $("#routeviewDropdown").empty();
        $("#routeviewDropdown4").empty();
        $("#routeviewDropdown5").empty();
                    jQuery.ajax({
                        type:'get',
                        dataType:'json',
                        url:'/populatetables',
                        success:function(data){
                            if(data == true){
                                alert("Files have been stored!");
                                jQuery.ajax({
                                    type:'get',
                                    dataType:'json',
                                    url:'/displaytables',
                                    success:function(data){
                                        if(data==false){
                                            alert("Failed to display status");
                                        }else{
                                            alert(`"Database has ${data.n1} files, ${data.n2} routes, and ${data.n3} points`);
                                            jQuery.ajax({
                                                type: 'get',
                                                dataType: 'json',
                                                url: '/gpxDropdowndatabase',
                                                success:function(data){
                                                    //appending to dropdown menu
                                                 //   console.log("test before2");
                                                    for(var i =0; i<data.length;i++){
                                                        $('#routeviewDropdown').append("<option class=\"filesTag3\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
                                                        $('#routeviewDropdown4').append("<option class=\"filesTag4\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
                                                        $('#routeviewDropdown5').append("<option class=\"filesTag5\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
                                                        //  console.log("second: " + data[i]);
                                                    }
                                                   // console.log("test after2");
                                                },
                                                
                                                fail:function(error){
                                                    //if fails
                                                }
                                            });   
                                        }
                                    },
                                    fail:function(error){
                        
                                    }
                                });
                            }else{
                                alert("Failed to Store Tables");
                            }
                        },
                        fail:function(error){
                          //  alert("Failed to Store Tables");
                        }
                    });
                
    });


    

    $(document).on("click","#cleartable",function(e){
        e.preventDefault();
        $("#routeviewDropdown").empty();
        $("#routeviewDropdown4").empty();
        $("#routeviewDropdown5").empty();
        jQuery.ajax({
            type:'get',
            dataType:'json',
            url:'/cleartables',
            success:function(data){
                if(data==true){
                    alert("Cleared Tables!");
                    jQuery.ajax({
                        type:'get',
                        dataType:'json',
                        url:'/displaytables',
                        success:function(data){
                            if(data==false){
                                alert("Failed to display status");
                            }else{
                                alert(`"Database has ${data.n1} files, ${data.n2} routes, and ${data.n3} points`);
                            }
                        },
                        fail:function(error){
            
                        }
                    });
                }else{
                    alert("Failed to clear tables");
                }
            },
            fail:function(error){

            }
        });
    });
   
    $(document).on("click","#displaytables",function(e){
        e.preventDefault();
        jQuery.ajax({
            type:'get',
            dataType:'json',
            url:'/displaytables',
            success:function(data){
                if(data==false){
                    alert("Failed to display status");
                }else{
                    alert(`"Database has ${data.n1} files, ${data.n2} routes, and ${data.n3} points`);
                }
            },
            fail:function(error){

            }
        });
    });
    $(document).on("click","#displaysqlroutes",function(e){
        e.preventDefault();
        $('#findsqltable').find('tbody').empty();
        jQuery.ajax({
            type:'get',
            dataType:'json',
            url:'/displayRoutestoTable',
            success:function(data){
                console.log("data" + data);
                if(data.len ==0){
                    alert("File is not in database or no routes!");
                }else if(data ==false){
                    alert("Please Sign into Database.");
                }
                console.log("data" + data);
                for(var i =0; i< data.length;i++){
                    $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
                }
            },
            fail:function(error){

            }
        });
    });

    $(document).on("click","#sortroutename",function(e){
        e.preventDefault();
        $('#findsqltable').find('tbody').empty();
        jQuery.ajax({
            type:'get',
            dataType:'json',
            url:'/displayRoutestoTableSorted',
            success:function(data){
                if(data.len ==0){
                    alert("File is not in database or no routes!");
                }else if(data ==false){
                    alert("Please Sign into Database.");
                }
                console.log("data" + data);
                for(var i =0; i< data.length;i++){
                    $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
                }
            },
            fail:function(error){

            }
        });
    });

    
    $(document).on("click","#sortroutelength",function(e){
        e.preventDefault();
        $('#findsqltable').find('tbody').empty();
        jQuery.ajax({
            type:'get',
            dataType:'json',
            url:'/displayRoutestoTablelensort',
            success:function(data){
                if(data.len ==0){
                    alert("File is not in database or no routes!");
                }else if(data ==false){
                    alert("Please Sign into Database.");
                }
                console.log("data" + data);
                for(var i =0; i< data.length;i++){
                    $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
                }
            },
            fail:function(error){

            }
        });
    });

    $(document).on('click','.filesTag3',function(){
        viewroutesFile = $(this).text().toString();
        alert("File: " + viewroutesFile+" selected.");
        //$('#gpxviewtable').find('tbody').empty();
        //gpxViewFile = $(this).text().toString();
        jQuery.ajax({
           type: 'get',
           dataType: 'json',
           url: '/displayRoutestoTable2',
           data:{
               filename: gpxViewFile
           },
           success: function(data){
               //append data to gpx view panel, 
              
               for(var i = 0; i < data.length ;i++){
               console.log(data[i]);
                   $('#gpxviewtable').find('tbody').append(JSONtoViewRow(data[i]));
               }
           },
           fail:function(error){
               //if console fails
               console.log("error table");
           }
       });
    });

    jQuery.ajax({
        type: 'get',
        dataType: 'json',
        url: '/gpxDropdowndatabase',
        success:function(data){
            //appending to dropdown menu
         //   console.log("test before2");
            for(var i =0; i<data.length;i++){
                $('#routeviewDropdown').append("<option class=\"filesTag3\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
              //  console.log("second: " + data[i]);
            }
           // console.log("test after2");
        },
        
        fail:function(error){
            //if fails
        }
    });
    jQuery.ajax({
        type: 'get',
        dataType: 'json',
        url: '/gpxDropdown2',
        success:function(data){
            //appending to dropdown menu
         //   console.log("test before2");
            for(var i =0; i<data.length;i++){
                $('#routeviewDropdown2').append("<option class=\"filesTag2\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
              //  console.log("second: " + data[i]);
            }
           // console.log("test after2");
        },
        
        fail:function(error){
            //if fails
        }
    });


//FOR QUERY 2 BUTTONS
$(document).on("click","#displaysqlroutes2",function(e){
    e.preventDefault();
    $('#findsqltable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displayRoutestoTable2',
        data:{
            file:viewroutesFile
        },
        success:function(data){
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database.");
            }
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});

$(document).on("click","#sortroutename2",function(e){
    e.preventDefault();
    $('#findsqltable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displayRoutestoTableSorted2',
        data:{
            file:viewroutesFile
        },
        success:function(data){
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database.");
            }
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});


$(document).on("click","#sortroutelength2",function(e){
    e.preventDefault();
    $('#findsqltable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displayRoutestoTablelensort2',
        data:{
            file:viewroutesFile
        },
        success:function(data){
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database.");
            }
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});



$(document).on("click","#displaywaysqlpoints",function(e){
    e.preventDefault();
    $('#findsqlwaypttable').find('tbody').empty();
    var routename = $("#routesearch").val();
    
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displaypointtosql',
        data:{
            rt:routename
        },
        success:function(data){
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("No route in database with that name.");
            }
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqlwaypttable').find('tbody').append(JSONtopointsSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});

jQuery.ajax({
    type: 'get',
    dataType: 'json',
    url: '/gpxDropdowndatabase',
    success:function(data){
        //appending to dropdown menu
     //   console.log("test before2");
        for(var i =0; i<data.length;i++){
            $('#routeviewDropdown4').append("<option class=\"filesTag4\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
          //  console.log("second: " + data[i]);
          
        }
       // console.log("test after2");
    },
    
    fail:function(error){
        //if fails
    }
});

$(document).on('click','.filesTag4',function(){
    viewpointsfile = $(this).text().toString();
    alert("File: " + viewpointsfile+" selected.");
    $('#findsqlwaypttable').find('tbody').empty();
    //$('#gpxviewtable').find('tbody').empty();
    //gpxViewFile = $(this).text().toString();
    jQuery.ajax({
       type: 'get',
       dataType: 'json',
       url: '/displaypointstoTable2',
       data:{
           file: viewpointsfile
       },
       success: function(data){
           
       },
       fail:function(error){
           //if console fails
           console.log("error table");
       }
   });
});



$(document).on("click","#sortwayname",function(e){
    e.preventDefault();
    $('#findsqlwaypttable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displaypointstoTableSorted',
        data:{
            file:viewpointsfile
        },
        success:function(data){
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database and select a file.");
            }
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqlwaypttable').find('tbody').append(JSONtopointsSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});

$(document).on("click","#sortwaylength",function(e){
    e.preventDefault();
    $('#findsqlwaypttable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displaypointstoTableSortedlen',
        data:{
            file:viewpointsfile
        },
        success:function(data){
            console.log("data" + data);
            
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database and select a file.");
            }
            
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqlwaypttable').find('tbody').append(JSONtopointsSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});


$(document).on("click","#sortwayall",function(e){
    e.preventDefault();
    $('#findsqlwaypttable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displaypointsq4',
        data:{
            file:viewpointsfile
        },
        success:function(data){
            console.log("data" + data);
            
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database and select a file.");
            }
            
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqlwaypttable').find('tbody').append(JSONtopointsSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});

jQuery.ajax({
    type: 'get',
    dataType: 'json',
    url: '/gpxDropdowndatabase',
    success:function(data){
        //appending to dropdown menu
     //   console.log("test before2");
        for(var i =0; i<data.length;i++){
            $('#routeviewDropdown5').append("<option class=\"filesTag5\" href=\"#\" >" +data[i].replace("./uploads/","")+"</option>");
          //  console.log("second: " + data[i]);
        }
       // console.log("test after2");
    },
    
    fail:function(error){
        //if fails
    }
});


$(document).on('click','.filesTag5',function(){
    q5file = $(this).text().toString();
    alert("File: " + q5file+" selected.");
    $('#findsqlwaypttable').find('tbody').empty();
    //$('#gpxviewtable').find('tbody').empty();
    //gpxViewFile = $(this).text().toString();
    jQuery.ajax({
       type: 'get',
       dataType: 'json',
       url: '/gpxDropdowndatabase',
       success: function(data){
           
       },
       fail:function(error){
           //if console fails
           console.log("error table");
       }
   });
});

$(document).on("click","#sortq5",function(e){
    e.preventDefault();
    var n=$("#nval").val();
    var lsv=$("#lsval").val();
    if(lsv == "L" || lsv == "S"){
        
    }else{
        alert("please enter L or S");
    }
    $('#findsqltable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displayq5',
        data:{
            file:q5file,
            nval:n,
            ls:lsv
        },
        success:function(data){
            console.log("data" + data);
            
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database and select a file.");
            }
            
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});


$(document).on("click","#sortq5len",function(e){
    e.preventDefault();
    var n=$("#nval").val();
    var lsv=$("#lsval").val();
    if(lsv == "L" || lsv == "S"){
        
    }else{
        alert("please enter L or S");
    }
    $('#findsqltable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displayq5len',
        data:{
            file:q5file,
            nval:n,
            ls:lsv
        },
        success:function(data){
            console.log("data" + data);
            
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database and select a file.");
            }
            
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});

$(document).on("click","#sortq5name",function(e){
    e.preventDefault();
    var n=$("#nval").val();
    var lsv=$("#lsval").val();
    if(lsv == "L" || lsv == "S"){
        
    }else{
        alert("please enter L or S");
    }
    $('#findsqltable').find('tbody').empty();
    jQuery.ajax({
        type:'get',
        dataType:'json',
        url:'/displayq5name',
        data:{
            file:q5file,
            nval:n,
            ls:lsv
        },
        success:function(data){
            console.log("data" + data);
            
            if(data.length==0){
                alert("no Route!");
            }else if(data ==false){
                alert("Please Sign into Database and select a file.");
            }
            
            console.log("data" + data);
            for(var i =0; i< data.length;i++){
                $('#findsqltable').find('tbody').append(JSONtoSQL(data[i]));
            }
        },
        fail:function(error){

        }
    });
});

});//end of app.ready

