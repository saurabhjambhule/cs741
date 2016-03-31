// function check(form) { /*function to check userid & password*/
//     /*the following code checkes whether the entered userid and password are matching*/

      window.onload = function() {
        var myButton = document.getElementById("btn-login");
        var form = document.getElementById("alpha");
        init_ZKP(form.userid.value,form.pswrd.value);
        myButton.addEventListener('click', function(){alert(form.pswrd.value);}, false);
        //document.getElementById("btn-login").onClick = function()console.log(form.pswrd.value);
      }

function init_ZKP(username, password){
	var shaObj = new jsSHA("SHA-512", "TEXT");
	shaObj.update(password);
	var hash = shaObj.getHash("HEX");
	
}
// }
