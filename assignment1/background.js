function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}


function sendPost(url, postData)
{
  var method = "POST";

  // You REALLY want async = true.
  // Otherwise, it'll block ALL execution waiting for server response.
  var async = true;

  var request = new XMLHttpRequest();

  // Before we send anything, we first have to say what we will do when the
  // server responds. This seems backwards (say how we'll respond before we send
  // the request? huh?), but that's how Javascript works.
  // This function attached to the XMLHttpRequest "onload" property specifies how
  // the HTTP response will be handled. 
  request.onload = function () {

     // Because of javascript's fabulous closure concept, the XMLHttpRequest "request"
     // object declared above is available in this function even though this function
     // executes long after the request is sent and long after this function is
     // instantiated. This fact is CRUCIAL to the workings of XHR in ordinary
     // applications.

     // You can get all kinds of information about the HTTP response.
     var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
     var data = request.responseText; // Returned data, e.g., an HTML document.
  }

  request.open(method, url, async);

  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // Or... request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
  // Or... whatever

  // Actually sends the request to the server.
  request.send(postData);
}

function init_ZKP(url)
{
  
}

chrome.webRequest.onHeadersReceived.addListener(
  function(info) {
    if(info.statusCode == 104) {
      init_ZKP(info.url);
    }
    // if (info.url.indexOf("www.") == -1) return {cancel: false};
    // var p = info.url.substr(info.url.indexOf("www.")+1).split("&");
    // for (var item in p) {
    //   var key = p[item].substr(p[item].indexOf("=")+1);
    //   if (checkxss(decodeURIComponent(JSON.stringify(key)).replace(/\+/gm," "))) return {cancel: true};
    // }
    // return {cancel: false};
  },
  // filters
  {
    urls: [
      "https://*/*",
      "http://*/*"
    ],
  },
  // extraInfoSpec
  []);
