package main

import (
	"crypto/elliptic"
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"

	"fmt"
	"io"
	"log"
	"math/big"
	"math/rand"
	"net/http"
	"strings"
	"text/template"

	"github.com/fatih/structs"
	"github.com/syndtr/goleveldb/leveldb"
)

type PreInfo struct {
	X string `json:"x"`
	Y string `json:"y"`
	Q string `json:"q"`
	A string `json:"a"`
	B string `json:"b"`
}

type CInfo struct {
	C string `json:"c"`
}

type userVerify struct {
	A []byte
	G []byte
	C []byte
}

func HandleRegisterECC(w http.ResponseWriter, r *http.Request) {
	tmpCurve := elliptic.P256() //generaet elliptic cureve (256b)
	//Get generator i.e. X and Y base points.
	// fmt.Println(tmpCurve.Params().Gx)
	// fmt.Println(tmpCurve.Params().Gy)
	// fmt.Println(tmpCurve.Params().B)
	// fmt.Println(tmpCurve.Params().N)
	// fmt.Println(tmpCurve.Params().P)

	//fmt.Println("X and Y points: ", tmpCurve.Params().Gx, tmpCurve.Params().Gy)

	randNo := rand.Uint32() //generate random number to generate random point on the curve
	//cunver the randomNo to bytes.
	bs := make([]byte, 4)
	binary.LittleEndian.PutUint32(bs, randNo)
	//fmt.Println("Random Number (B): ", bs)

	newX, newY := tmpCurve.ScalarBaseMult(bs) //generate p0 random point on the curve using randomNo
	//fmt.Println("X and Y points: ", newX, newY)
	//fmt.Println(tmpCurve.IsOnCurve(newX, newY)) //check whether the point is on curve or not

	//Send the p0 to cliennt in form of string through "warning" field of http response header.
	strX := newX.String()
	strY := newY.String()
	newB := tmpCurve.Params().B
	newN := tmpCurve.Params().N
	newP := tmpCurve.Params().P
	strB := newB.String()
	strN := newN.String()
	strP := newP.String()

	Point := strX + " " + strY + " " + strB + " " + strN + " " + strP
	fmt.Printf("%x\n", Point)
	w.Header().Set("WWW-Authenticate", Point)
	//set server type to "ZKP" in http response header.
	w.Header().Set("Server", "ZKP")

	//This will send client registration html page.
	title := r.URL.Path[len("/"):]
	p, err := loadPage(title)
	if err != nil {
		p = &Page{Title: title}
	}
	t, _ := template.ParseFiles("register.html")
	t.Execute(w, p)
}

func HandleLoginECC(w http.ResponseWriter, r *http.Request) {
	//This will send client login html page.
	title := r.URL.Path[len("/"):]
	p, err := loadPage(title)
	if err != nil {
		p = &Page{Title: title}
	}
	t, _ := template.ParseFiles("login.html")
	t.Execute(w, p)
}

func HandleRegisterBasic(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandleRegisterBasic")
	tmpCurve := elliptic.P256()
	r.ParseMultipartForm(int64(100))
	step := strings.TrimSpace(r.PostFormValue("step"))
	//state := strings.TrimSpace(r.PostFormValue("state"))
	if step == "0" {
		//fmt.Println(step, ":", state)
		w.Header().Set("Content-Type", "application/json")
		preInfo, _ := json.Marshal(PreInfo{tmpCurve.Params().Gx.String(), tmpCurve.Params().Gy.String(), tmpCurve.Params().P.String(), tmpCurve.Params().B.String(), tmpCurve.Params().N.String()})
		//fmt.Println(string(preInfo))
		io.WriteString(w, string(preInfo))
	}
	if step == "1" {
		//fmt.Println(step, "::", state)
		pubKey := strings.TrimSpace(r.PostFormValue("pub_key"))
		fmt.Println(pubKey)
		uname := strings.TrimSpace(r.PostFormValue("uname"))
		key := strings.Split(pubKey, ",")
		pX := new(big.Int)
		pY := new(big.Int)
		pX.SetString(key[0], 10)
		pY.SetString(key[1], 10)
		dataB = elliptic.Marshal(tmpCurve, pX, pY)
		fmt.Println(">>>>>>>", uname)
		fmt.Println(">>>>>>>", dataB)

		storeData(uname, dataB)
		_, _ = getData(uname)
	}
}

func HandleLoginBasic(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HandleLoginBasic")
	tmpCurve := elliptic.P256()
	r.ParseMultipartForm(int64(100))
	step := strings.TrimSpace(r.PostFormValue("step"))
	state := strings.TrimSpace(r.PostFormValue("state"))
	if step == "0" {
		fmt.Println(step, ":", state)
		w.Header().Set("Content-Type", "application/json")
		preInfo, _ := json.Marshal(PreInfo{tmpCurve.Params().Gx.String(), tmpCurve.Params().Gy.String(), tmpCurve.Params().P.String(), tmpCurve.Params().B.String(), tmpCurve.Params().N.String()})
		fmt.Println(string(preInfo))
		io.WriteString(w, string(preInfo))
	}
	if step == "1" {
		fmt.Println(step, "::", state)
		rand := strings.TrimSpace(r.PostFormValue("login_init_data"))
		fmt.Println(">>", rand)

		key := strings.Split(rand, ",")
		pX := new(big.Int)
		pY := new(big.Int)
		pX.SetString(key[0], 10)
		pY.SetString(key[1], 10)
		dataA = elliptic.Marshal(tmpCurve, pX, pY)

		uname := strings.TrimSpace(r.PostFormValue("uname"))
		fmt.Println("#####", uname)
		gByt := elliptic.Marshal(tmpCurve, tmpCurve.Params().Gx, tmpCurve.Params().Gy)
		dataG = gByt
		//aByt := []byte(rand)
		//dataA = aByt

		_, commonPt := getData(uname)
		dataB = commonPt
		new1 := append(gByt, commonPt...)
		new2 := append(new1, dataA...)
		hash := sha256.Sum256(new2)
		cByt, _ := json.Marshal(CInfo{string(hash[:32])})
		dataC = cByt
		fmt.Println(string(cByt))
		io.WriteString(w, string(cByt))
		fmt.Println("s>>>")
	}
	if step == "2" {
		fmt.Println(step, "::", state)

		m := strings.TrimSpace(r.PostFormValue("login_response_data"))

		fmt.Println("---------->>>>>>")
		fmt.Println("A- ", string(dataA))
		fmt.Println("G- ", string(dataG))
		fmt.Println("C- ", string(dataC))
		fmt.Println("B- ", string(dataB))
		fmt.Println("M- ", m)
		t1, t2 := tmpCurve.ScalarBaseMult([]byte(m))
		//pY := new(big.Int)
		//pY.SetString(string(dataC), 10)

		tx, ty := elliptic.Unmarshal(tmpCurve, dataB)
		t3, t4 := tmpCurve.ScalarMult(tx, ty, dataC)

		//ttt := new(big.Int)
		//ttt.SetInt64(int64(-1))
		tt1, tt2 := tmpCurve.ScalarMult(t3, t4, []byte("-1"))
		t5, t6 := tmpCurve.Add(t1, t2, tt1, tt2)

		final := elliptic.Marshal(tmpCurve, t5, t6)
		fmt.Println("****>>", string(final), " - ", string(dataA))
		//pX, pY := tmpCurve.ScalarMult(tmpCurve.Params().Gx, tmpCurve.Params().Gy, []byte(m))

	}
}

func HandlePage(w http.ResponseWriter, r *http.Request) {
	title := r.URL.Path[len("/"):]
	p, err := loadPage(title)
	if err != nil {
		p = &Page{Title: title}
	}
	t, _ := template.ParseFiles(title)
	t.Execute(w, p)
}

func HandleICon(w http.ResponseWriter, r *http.Request) {
}

func storeData(uname string, pubKey []byte) {
	db, err := leveldb.OpenFile("data.db", nil)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	err = db.Put([]byte(uname), pubKey, nil)
}

func getData(uname string) (bool, []byte) {
	db, err := leveldb.OpenFile("data.db", nil)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	iter := db.NewIterator(nil, nil)
	for iter.Next() {
		key := iter.Key()
		fmt.Println(string(key), " - ", uname)
		if string(key) == uname {
			value := iter.Value()
			fmt.Printf("uname: %s | pubKey: %s\n", key, value)
			return true, value
		}
	}
	return false, nil
}

var vInfo *structs.Struct
var dataG, dataA, dataC, dataB []byte

func main() {
	vvInfo := &userVerify{A: nil, G: nil, C: nil}
	vInfo = structs.New(vvInfo)
	/* Handler: Request handling logic and response generation. */
	http.HandleFunc("/", HandlePage)
	http.HandleFunc("/favicon.ico", HandleICon)
	http.HandleFunc("/login-basic", HandleLoginBasic)
	http.HandleFunc("/register-basic", HandleRegisterBasic)
	http.HandleFunc("/login-ecc", HandleLoginECC)
	http.HandleFunc("/register-ecc", HandleRegisterECC)

	err := http.ListenAndServe(":9090", nil) //set listen port to 9090
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
