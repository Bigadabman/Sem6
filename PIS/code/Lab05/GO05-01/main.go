package main

import (
	celebrity_lib "GO05-01/GO05-01lib"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/microsoft/go-mssqldb"
)

func main() {
	const conn string = "server=localhost,1433;user id=sa;password=123456Qwerty!d;database=master;encrypt=disable"
	if db, err := sql.Open("sqlserver", conn); err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	} else {
		fmt.Println("Connected")
		defer db.Close()
	}
	r := mux.NewRouter()

	r.HandleFunc("/Celebrities/All", celebrity_lib.GetAllCelebrities).Methods(http.MethodGet)
	r.HandleFunc("/Celebrities/{id:[0-9]+}", celebrity_lib.GetCelebrityById).Methods(http.MethodGet)
	r.HandleFunc("/Celebrities", celebrity_lib.PostCelebrity).Methods(http.MethodPost)
	r.HandleFunc("/Celebrities/{id:[0-9]+}", celebrity_lib.PutCelebrity).Methods(http.MethodPut)
	r.HandleFunc("/Celebrities/{id:[0-9]+}", celebrity_lib.DeleteCelebrity).Methods(http.MethodDelete)

	fmt.Println("Server started at http://localhost:3000/Celebrities/All")
	http.ListenAndServe("localhost:3000", r)
	fmt.Print("Finished")
}
