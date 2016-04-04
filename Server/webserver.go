package main

import (
	"crypto/elliptic"
	"encoding/binary"
	"encoding/json"

	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"text/template"

	"github.com/syndtr/goleveldb/leveldb"
)

type PreInfo struct {
	X string `json:"x"`
	Y string `json:"y"`
	Q string `json:"q"`
	A string `json:"a"`
	B string `json:"b"`
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
		pubKey := strings.TrimSpace(r.PostFormValue("pub_key"))
		fmt.Println(pubKey)
		uname := strings.TrimSpace(r.PostFormValue("uname"))
		fmt.Println(uname)
		storeData(uname, pubKey)
		_, _ = getData(uname)
	}
}

func HandleLoginBasic(w http.ResponseWriter, r *http.Request) {
	//This will send client login html page.
	title := r.URL.Path[len("/"):]
	p, err := loadPage(title)
	if err != nil {
		p = &Page{Title: title}
	}
	t, _ := template.ParseFiles("login.html")
	t.Execute(w, p)
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

func storeData(uname string, pubKey string) {
	db, err := leveldb.OpenFile("data.db", nil)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	err = db.Put([]byte(uname), []byte(pubKey), nil)
}

func getData(uname string) (bool, string) {
	db, err := leveldb.OpenFile("data.db", nil)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	iter := db.NewIterator(nil, nil)
	for iter.Next() {
		key := iter.Key()
		if string(key) == uname {
			value := iter.Value()
			fmt.Printf("uname: %s | pubKey: %s\n", key, value)
			return true, string(value)
		}
	}
	return false, "not found"
}

func main() {
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
