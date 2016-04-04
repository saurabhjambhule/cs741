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

function ECC_get_init() {
    return "Initial stuff";

    
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
    // var q = 11;
    // var a = 2;
    // var b = 3;
    // var x = 4;
    // var y = 7;
    // var curve = new ECCurveFP(q, a, b);
    // alert(curve.q);
    // var genPt = new ECPointFP(curve, x, y, null);

    // var randNo = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    // var ptA = genPt.multiply(randNo);
    //alert(ptA);
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
    return ECC_get_int();
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

    var data = get_ZKP_inits();
    var req = new XMLHttpRequest();
    req.open('POST', document.location, false);
    req.send("state=login&step=0&login_init_data=" + data.toString());

    var challenge = JSON.parse(req.responseText);

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
