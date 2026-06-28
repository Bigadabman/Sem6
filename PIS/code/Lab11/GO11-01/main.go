package main

import (
	celebrity_lib "GO11-01/GO11-01lib"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

func main() {
	if err := celebrity_lib.InitDB(); err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	}
	defer celebrity_lib.CloseDB()

	r := mux.NewRouter()

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/swagger/index.html", http.StatusFound)
	}).Methods(http.MethodGet)
	r.PathPrefix("/swagger/").Handler(httpSwagger.Handler(
		httpSwagger.URL("/openapi.json"),
	))
	r.HandleFunc("/openapi.json", celebrity_lib.OpenAPIHandler).Methods(http.MethodGet)
	r.HandleFunc("/Celebrities/All", celebrity_lib.GetAllCelebrities).Methods(http.MethodGet)
	r.HandleFunc("/Celebrities/{id:[0-9]+}", celebrity_lib.GetCelebrityById).Methods(http.MethodGet)
	r.HandleFunc("/Celebrities", celebrity_lib.PostCelebrity).Methods(http.MethodPost)
	r.HandleFunc("/Celebrities/{id:[0-9]+}", celebrity_lib.PutCelebrity).Methods(http.MethodPut)
	r.HandleFunc("/Celebrities/{id:[0-9]+}", celebrity_lib.DeleteCelebrity).Methods(http.MethodDelete)

	fmt.Println("Server started at http://localhost:3000/Celebrities/All")
	fmt.Println("OpenAPI: http://localhost:3000/openapi.json")
	fmt.Println("Swagger UI: http://localhost:3000/swagger")
	http.ListenAndServe("localhost:3000", r)
	fmt.Print("Finished")
}
