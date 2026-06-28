package main

import (
	P03_02 "GO03-02/P03-02"
	"fmt"
	"net/http"
)

func NotFound(w http.ResponseWriter, r* http.Request){
	http.Error(w, "Path not found", http.StatusNotFound)
}

func MethodNotAllowed(w http.ResponseWriter, r* http.Request){
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

	var methodCounter P03_02.MethodCounter

func handler(w http.ResponseWriter, r* http.Request){
	switch r.Method{
	case "GET":
		switch r.URL.Path{
		case "/S":
			methodCounter.PlusGet()
		case "/G":
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			fmt.Fprint(w, methodCounter.GenStr())
		default:
			NotFound(w,r)
		}
	case "POST":
		if(r.URL.Path == "/S"){
			methodCounter.PlusPost()
		} else{
			NotFound(w,r)
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