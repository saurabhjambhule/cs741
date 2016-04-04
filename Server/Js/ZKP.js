function fromHex(s) { return new BigInteger(s, 16); }
function fromDec(s) { return new BigInteger(s, 10); }

var p = fromHex("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF");
var a = fromHex("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC");
var b = fromHex("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B");
var n = fromHex("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551");
var h = BigInteger.ONE;
var curve = new ECCurveFp(p, a, b);

function ECC_save_init(data) {
    for (var key in data) {
      localStorage.setItem(key.toString(),fromDec(data[key]).toString(16));
    }
}

function ECC_get_init(gen) {
    var G = curve.decodePointHex("04" + fromDec(gen["x"]).toString(16) + fromDec(gen["y"]).toString(16));
    var randNo = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    var hexString = fromHex(randNo.toString(16));
    localStorage.setItem("rand",hexString);
    var randpt = G.multiply(hexString);
    return randpt.getX().toBigInteger().toString(10) + "," + randpt.getY().toBigInteger().toString(10);
}

function ECC_gen_response(challenge, hash) {
    var r = fromHex(localStorage.getItem("rand"));
    var c = fromDec(challenge);
    var x = fromHex(hash);
    var multres;
    x.multiplyTo(c,multres);
    var addres;
    multres.SubTo(r.negate(),addres);
    var result = addres.mod(p);
    return result.toString(10);
}

function ECC_create_reg_value(hash) {
    document.getElementById("gen").value = localStorage.getItem("x").toString() + localStorage.getItem("y").toString();
    var hash_bigInt = fromHex(hash.toString());
    var G = curve.decodePointHex("04" + localStorage.getItem("x").toString() + localStorage.getItem("y").toString());
    var pub_key = G.multiply(hash_bigInt);
    return pub_key.getX().toBigInteger().toString(10) + "," + pub_key.getY().toBigInteger().toString(10);
}

function get_ZKP_inits(gen) {
    return ECC_get_init(gen);
}

function save_ZKP_inits(data) {
    ECC_save_init(data);
}

function generate_ZKP_response(challenge, hash) {
    return ECC_gen_response(challenge, hash);
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

    var req = new XMLHttpRequest();
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.open('POST', "login-basic", false);
    req.send("state=login&step=0");
    var reply = JSON.parse(req.responseText);

    var data = get_ZKP_inits(reply);
    var req = new XMLHttpRequest();
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.open('POST', "login-basic", false);
    req.send("state=login&step=1&login_init_data=" + data.toString());
    var challenge = JSON.parse(req.responseText);

    var response = generate_ZKP_response(challenge, hash);
    req = new XMLHttpRequest();
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.open('POST', "login-basic", false);
    req.send("state=login&step=2&login_response_data=" + response.toString());
}

function register_ZKP(form) {
    var pass1 = form.psswd.value;
    var pass2 = form.cpsswd.value;

    if (!(pass1 === pass2)) {
        alert("Password mismatch!!");
        return;
    }

    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(form.psswd.value);
    var uname = form.userid.value;
    var hash = shaObj.getHash("HEX");

    document.getElementById("pwdhash").value = hash;

    var req = new XMLHttpRequest();
    req.open('POST', "register-basic", false);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send("state=register&step=0");
    var data = JSON.parse(req.responseText);

    //Save data
    save_ZKP_inits(data);

    //Send data
    var reg_value = create_ZKP_reg_value(hash);
    document.getElementById("pubkey").value = reg_value;
    var req1 = new XMLHttpRequest();
    req1.open('POST', "register-basic", false);
    req1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req1.send("state=register&step=1&uname="+ uname +"&pub_key=" + reg_value.toString());
}
