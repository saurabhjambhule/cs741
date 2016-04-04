function fetchJSONFile(url, postData, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('POST', url, false);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(postData);
}

function get_item_from_storage(item) {
    if (localStorage.getItem(item)) return localStorage.getItem(item);
    else {
        alert("ZKP failed!");
        return false;
    }
}

function ECC_save_init(data) {
    alert(JSON.stringify(data));
    var x = data.x;
    var y = data.y;
    var q = data.q;
    var a = data.a;
    var b = data.b;

    localStorage.setItem("q", q);
    localStorage.setItem("a", a);
    localStorage.setItem("b", b);
    localStorage.setItem("x", x);
    localStorage.setItem("y", y);
}

function fromHex(s) { return new BigInteger(s, 16); }
function ECC_get_init() {

  var p = fromHex("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF");
   var a = fromHex("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC");
   var b = fromHex("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B");
   //byte[] S = Hex.decode("C49D360886E704936A6678E1139D26B7819F7E90");
   var n = fromHex("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551");
   var h = BigInteger.ONE;
   var curve = new ECCurveFp(p, a, b);
   var G = curve.decodePointHex("04"
                + "188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012"
                + "07192B95FFC8DA78631011ED6B24CDD573F977A11E794811");
   //var genPt = new ECPointFP(curve, x, y, null);
//  alert(curve.q);
    // var genPt = new ECPointFP(curve, x, y, null);
    //var t= pointFpGetX();


    var randNo = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    var hexString = randNo.toString(16);
    var randNo=fromHex(hexString);
    var ptA = G.multiply(randNo);
    alert(ptA;
      return "Initial stuff";
    //send to Server ptA and receive c

    //Compute c+r.x and send to server
}

function ECC_gen_response(challenge) {
    return "Arbit FART!";
}

function ECC_create_reg_value(hash) {
    return hash;
}

function get_ZKP_inits() {
    return ECC_get_init();
}

function save_ZKP_inits(data) {
    ECC_save_init(data);
}

function generate_ZKP_response(challenge) {
    return ECC_gen_response(challenge);
}

function create_ZKP_reg_value(hash) {
    return ECC_create_reg_value(hash);
}

function login_ZKP() {
    var form = document.getElementById("form-login");
    var username = form.userid.value;
    var password = form.pswrd.value;

    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(password);
    var hash = shaObj.getHash("HEX");
    //alert("in");
    var data = get_ZKP_inits();
    var req = new XMLHttpRequest();
    req.open('POST', document.location, false);
    req.send("state=login&step=0&login_init_data=" + data.toString());

    var challenge = JSON.parse(req.responseText);
    //var challenge = "temp";
    var response = generate_ZKP_response(challenge);
    req = new XMLHttpRequest();
    req.open('POST', document.location, false);
    req.send("state=login&step=1&login_response_data=" + response.toString());
}

function register_ZKP(form) {
    var pass1 = form.psswd.value;
    var pass2 = form.cpsswd.value;

    if (!(pass1 === pass2)) {
        alert("Password mismatch!!");
        return;
    }

    var req = new XMLHttpRequest();
    req.open('POST', "register-basic", false);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    /* --Using Call back function --
    req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
        var data = JSON.parse(req.responseText);
        save_ZKP_inits(data);
        }
    }; */

    req.send("state=register&step=0");
    var data = JSON.parse(req.responseText);
    //Save data
    save_ZKP_inits(data);

    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(form.psswd.value);
    var uname = form.userid.value;
    var hash = shaObj.getHash("HEX");

    //Send data
    var reg_value = create_ZKP_reg_value(hash);
    var req1 = new XMLHttpRequest();

    req1.open('POST', "register-basic", false);
    req1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req1.send("state=register&step=1&uname="+ uname +"&pub_key=" + reg_value.toString());

}
