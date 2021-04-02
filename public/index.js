
let gpxViewFile = "";
let addRouteFile = "";
let jsonlatlonstring ="";
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
                $('#gpxDropdown2').append("<a class=\"filesTag2\" href=\"#\" >" +data[i].replace("./uploads/","")+"</a>");
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

    $('#sendRoutename').click(function(){
        var ogName = '';
        var newName = '';
        ogName =  $('#fname1').val();
        newName = $('#lname1').val();
        
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
                //console.log("data" + data);
              //  alert("Please reselect the filename to see the new changes!");
                $('#gpxviewtable').find('tbody').append(JSONtoViewRow(data));
               // alert(JSONtoDataHtml(data));
             //  alert("Please reselect the filename to see the new changes!");
            },
            fail:function(error){
                //iffails
                console.log("failed send RouteName.");
            }
     });
    });

    $('#gpxnewfile').click(function(){
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
                        $('#gpxDropdown2').append("<a class=\"filesTag2\" href=\"#\" >" +gpxfile+"</a>");
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
              
            },
            fail:function(error){
                //iffails
                console.log("failed find path.");
            }
     });
    });

    $('#sendAddRouteInfo').click(function(){
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


    $('#someform').submit(function(e){
        $('#blah').html("Form has data: "+$('#entryBox').val());
        e.preventDefault();
        //Pass data to the Ajax call, so it gets passed to the server
        $.ajax({
            //Create an object for connecting to another waypoint
        });
    });
});//end of app.ready

