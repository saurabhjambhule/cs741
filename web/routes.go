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
	"text/template"
)

func HandleIndex(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "hello, world\n")
	tmpCurve := elliptic.P256()
	fmt.Println(tmpCurve.Params().Gx)
	fmt.Println(tmpCurve.Params().Gy)

	randNo := rand.Uint32()
	fmt.Println(randNo)

	bs := make([]byte, 4)
	binary.LittleEndian.PutUint32(bs, randNo)
	fmt.Println(bs)

	newX, newY := tmpCurve.ScalarBaseMult(bs)
	fmt.Println(newX, newY)

	fmt.Println(tmpCurve.IsOnCurve(newX, newY))
	strX := newX.String()
	strY := newY.String()
	Point := strX + " " + strY

	fmt.Println(Point)
	w.Header().Set("Access-Control-Allow-Origin", "Point")
	//r.Header.Add("Point", Point)

	//io.WriteString(w, Point)

}

func HandlePage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Page Loaded")
	w.Header().Set("Server", "ZKP")
	//w.WriteHeader(201)
	title := r.URL.Path[len("/"):]
	p, err := loadPage(title)
	if err != nil {
		p = &Page{Title: title}
	}
	t, _ := template.ParseFiles("index.html")
	t.Execute(w, p)
}

func HandlePost(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	log.Println(r.PostForm)
	io.WriteString(w, "post\n")
}

type Result struct {
	FirstName string `json:"first"`
	LastName  string `json:"last"`
}

func HandleJSON(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	result, _ := json.Marshal(Result{"tee", "dub"})
	io.WriteString(w, string(result))
}
