package main

import (
	celebrity_lib "GO10-01/GO10-01lib"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	if err := celebrity_lib.InitDB(); err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	}
	defer celebrity_lib.CloseDB()

	if err := celebrity_lib.InitGraphQL(); err != nil {
		fmt.Println("Error creating GraphQL schema:", err)
		return
	}

	r := mux.NewRouter()
	r.HandleFunc("/graphql", celebrity_lib.GraphQLHandler).Methods(http.MethodPost)

	fmt.Println("Server started at http://localhost:3000/graphql")
	http.ListenAndServe("localhost:3000", r)
	fmt.Print("Finished")
}
