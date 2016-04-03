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

function get_item_from_storage(item){
  if(localStorage.getItem(item)) return localStorage.getItem(item);
  else {
    alert("ZKP failed!");
    return false;
  }
}

function ZKP(){
  var form = document.getElementById("form-login");
  var username = form.userid.value;
  var password = form.pswrd.value;
  //alert("Heart of Stone");
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(password);
  var hash = shaObj.getHash("HEX");
  //alert(hash);
  // var q = get_item_from_storage("q");
  // var a = get_item_from_storage("a");
  // var b = get_item_from_storage("b");
  // var x = get_item_from_storage("x");
  // var y = get_item_from_storage("y");
  // var q = new BigInteger("115792089210356248762697446949407573530086143415290314195533631308867097853951",10);
  // var a = new BigInteger("115792089210356248762697446949407573530086143415290314195533631308867097853948",10);
  // var b = new BigInteger("2566147732822008883082883111252954275569652563499607847177203519627466711115",10);
  // var x = new BigInteger("48439561293906451759052585252797914202762949526041747995844080717082404635286",10);
  // var y = new BigInteger("36134250956749795798585127919587881956611106672985015071877198253568414405109",10 );
  var q = 11;
  var a = 2;
  var b = 3;
  var x = 4;
  var y = 7;
  alert("times up nigga!");
  var curve = new ECCurveFP(q,a,b);
  alert(curve.q);
  var genPt = new ECPointFP(curve,x,y,null);

  var randNo = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  var ptA = genPt.multiply(randNo);
  //alert(ptA);
  //send to Server ptA and receive c

  //Compute c+r.x and send to server
}
