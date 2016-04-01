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
  var async = true;
  var request = new XMLHttpRequest();

  request.onload = function () {
     var status = request.status;
     var data = request.responseText;
  }

  request.open(method, url, async);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(postData);
}

function get_item_from_storage(var item){
  if(localStorage.getItem(item)) return localStorage.getItem(item);
  else {
    alert("ZKP failed!");
    return false;
  }
}

function ZKP(username, password){
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(password);
  var hash = shaObj.getHash("HEX");

  var q = get_item_from_storage("q");
  var a = get_item_from_storage("a");
  var b = get_item_from_storage("b");
  var x = get_item_from_storage("x");
  var y = get_item_from_storage("y");

  if !(a && b && q && x && y) return;

  var curve = new ECCurveFP(q,a,b);
  var genPt = new ECPointFP(curve,x,y,null);

  var randNo = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  var ptA = genPt.multiply(randNo);

  //send to Server ptA and receive c

  //Compute c+r.x and send to server
}

window.onload = function() {
  var myButton = document.getElementById("btn-login");
  var form = document.getElementById("form-login");
  myButton.addEventListener('click', function(){
    ZKP(form.userid.value,form.pswrd.value);
  }, false);
}
