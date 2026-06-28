package main

import (
	"fmt"
	"log"
	"net/http"
)

func GetRoute(w http.ResponseWriter,r* http.Request){
	log.Printf("%s %s\n", r.Method, r.URL.Path)
	fmt.Fprintf(w, "%s %s\n", r.Method, r.URL.Path)
}

func MethodNotAllowed(w http.ResponseWriter,r* http.Request){
	http.Error(w, "Method not allowed: ", http.StatusMethodNotAllowed)
}

func handler(w http.ResponseWriter, r *http.Request){
	switch r.Method{
	case "GET":
		switch r.URL.Path{
		case "/A", "/A/B":
			GetRoute(w,r);
		default:
			GetRoute(w,r)
		}
	case "POST":
		switch r.URL.Path{
		case "/A", "/A/B":
			GetRoute(w,r);
		default:
			GetRoute(w,r)
		}
	case "PUT":
		switch r.URL.Path{
		case "/A", "/A/B":
			GetRoute(w,r);
		default:
			GetRoute(w,r)
		}
	default:
		MethodNotAllowed(w,r)
	}

}


func main(){
	http.HandleFunc("/", handler)
	fmt.Println("Server started on http://localhost:3000")
	http.ListenAndServe("localhost:3000", nil)
	fmt.Println("main")
}