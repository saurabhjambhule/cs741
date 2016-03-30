package main

import (
	"log"
	"net/http"
)

func main() {

	// Handler: Request handling logic and response generation.
	// public views
	http.HandleFunc("/", HandleIndex)
	http.HandleFunc("/index.html", HandlePage)

	// private views
	http.HandleFunc("/post", PostOnly(BasicAuth(HandlePost)))
	http.HandleFunc("/json", GetOnly(BasicAuth(HandleJSON)))

	err := http.ListenAndServe(":9090", nil) //set listen port
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
