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

function send_Init()
{

}

function send_ChallengeResponse()
{
  
}


function init_ZKP(url)
{
  send_Init();
  send_ChallengeResponse(); 
}

function init_ZKP(username, password){
  var shaObj = new jsSHA("SHA-512", "TEXT");
  shaObj.update(password);
  var hash = shaObj.getHash("HEX");
  alert(hash);
}

window.onload = function() {
  var myButton = document.getElementById("btn-login");
  var form = document.getElementById("form-login");
  myButton.addEventListener('click', function(){init_ZKP(form.userid.value,form.pswrd.value);}, false);
}