package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"text/template"
)

func HandleIndex(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "hello, world\n")
}

func HandlePage(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Page Loaded")
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
