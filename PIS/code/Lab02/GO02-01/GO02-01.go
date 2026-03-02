package main

import (
	GO02_01lib "GO02-01/GO02-01lib"
	"fmt"
	"net/http"
)

const C01 = 3.14

func handler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		fmt.Fprintf(w, "C01 = %e", C01)
		fmt.Fprintf(w, "\nC02 = %e", C02)
		fmt.Fprintf(w, "\nC03 = %e", GO02_01lib.C03)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Server running at http://localhost:3000")
	http.ListenAndServe("localhost:3000", nil)
	fmt.Println("main")
}
