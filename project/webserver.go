package main

import (
	"crypto/elliptic"
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"text/template"
)

func HandlePage(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "hello, world\n")
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	tmpCurve := elliptic.P256() //generaet elliptic cureve (256b)
	//Get generator i.e. X and Y base points.
	//fmt.Println(tmpCurve.Params().Gx)
	//fmt.Println(tmpCurve.Params().Gy)

	randNo := rand.Uint32() //generate random number to generate random point on the curve
	//cunver the randomNo to bytes.
	bs := make([]byte, 4)
	binary.LittleEndian.PutUint32(bs, randNo)
	fmt.Println("Random Number (B): ", bs)

	newX, newY := tmpCurve.ScalarBaseMult(bs) //generate p0 random point on the curve using randomNo
	fmt.Println("X and Y points: ", newX, newY)
	fmt.Println(tmpCurve.IsOnCurve(newX, newY)) //check whether the point is on curve or not

	//Send the p0 to cliennt in form of string through "warning" field of http response header.
	strX := newX.String()
	strY := newY.String()
	Point := strX + " " + strY
	w.Header().Set("Warning", Point)
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

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	//This will send client login html page.
	title := r.URL.Path[len("/"):]
	p, err := loadPage(title)
	if err != nil {
		p = &Page{Title: title}
	}
	t, _ := template.ParseFiles("login.html")
	t.Execute(w, p)
}

func main() {
	/* Handler: Request handling logic and response generation. */
	// This will call function HandlePage, if link is like "http://0.0.0.0:9090".
	http.HandleFunc("/", HandlePage)
	// This will call function HandleLogin, if link is like "http://0.0.0.0:9090/login".
	http.HandleFunc("/login", HandleLogin)
	// This will call function HandleRegister, if link is like "http://0.0.0.0:9090/register".
	http.HandleFunc("/register", HandleRegister)

	err := http.ListenAndServe(":9090", nil) //set listen port to 9090
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
