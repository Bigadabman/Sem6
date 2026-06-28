package main

import (
	celebrity_lib "GO04-01/GO04-01lib"
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/gorilla/mux"
)

func main() {

	fileData, err := celebrity_lib.ReadData()
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	err = json.Unmarshal(fileData, &celebrity_lib.CelebrityList)
	if err != nil {
		fmt.Println("Error parsing JSON:", err)
		return
	}

	fmt.Printf("Loaded %d celebrities\n", len(celebrity_lib.CelebrityList))

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
