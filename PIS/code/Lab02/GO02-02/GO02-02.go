package main

import (
	GO02_02lib "GO02-02/GO02-02lib"
	"fmt"
	"net/http"
)

var A01 int32 = 3

func handler(w http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case "GET":
		fmt.Fprintf(w, "A01 = %d", A01)
		fmt.Fprintf(w, "\nA02 = %t", A02)
		fmt.Fprint(w, "\nA03 = ", GO02_02lib.A03)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server running at http://localhost:4000")
	http.ListenAndServe("localhost:4000", nil)
}
