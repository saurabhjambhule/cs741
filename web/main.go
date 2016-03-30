package main

import (
    "log"
    "net/http"
)

func main() {

    // public views
    http.HandleFunc("/", HandleIndex)

    // private views
    http.HandleFunc("/post", PostOnly(BasicAuth(HandlePost)))
    http.HandleFunc("/json", GetOnly(BasicAuth(HandleJSON)))

    log.Fatal(http.ListenAndServe(":8080", nil))
}
