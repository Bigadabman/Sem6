package celebrity_lib

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

const FilePath = "./Celebrities.json"

type Celebrity struct {
	Id           int    `json:"id"`
	FullName     string `json:"fullName"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `json:"reqPhotoPath"`
}

var CelebrityList []Celebrity

func MethodNotAllowed(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "Method not allowed: ", http.StatusMethodNotAllowed)
}

func ReadData() ([]byte, error) {
	if _, err := os.Stat(FilePath); os.IsNotExist(err) {
		defaultContent := []byte("[]")
		if err := os.WriteFile(FilePath, defaultContent, 0644); err != nil {
			return nil, fmt.Errorf("error creating file: %v", err)
		}
	}

	data, err := os.ReadFile(FilePath)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func SaveShanges() error {
	data, err := json.MarshalIndent(CelebrityList, "", "  ")
	if err != nil {
		return fmt.Errorf("Error marshaling data: %v", err)
	}
	return os.WriteFile(FilePath, data, 0644)
}

func GetAllCelebrities(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(CelebrityList); err != nil {
		http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetCelebrityById(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	w.Header().Set("Content-Type", "application/json")

	for _, celeb := range CelebrityList {
		if id == fmt.Sprintf("%d", celeb.Id) {

			if err := json.NewEncoder(w).Encode(celeb); err != nil {
				http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
				return
			}
			return
		}
	}
	http.Error(w, "Celebrity not found", http.StatusNotFound)
}

func PostCelebrity(w http.ResponseWriter, r *http.Request) {
	var newCeleb Celebrity
	if err := json.NewDecoder(r.Body).Decode(&newCeleb); err != nil {
		http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}

	for _, celeb := range CelebrityList {
		if newCeleb.Id == celeb.Id {
			http.Error(w, "Celebrity with this ID already exists: ", http.StatusConflict)
			return
		}
	}
	CelebrityList = append(CelebrityList, newCeleb)
	SaveShanges()
}

func PutCelebrity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var updatedCeleb Celebrity
	if err := json.NewDecoder(r.Body).Decode(&updatedCeleb); err != nil {
		http.Error(w, "Error encoding JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
	for i, celeb := range CelebrityList {
		if id == fmt.Sprintf("%d", celeb.Id) {
			CelebrityList[i] = updatedCeleb
			SaveShanges()
			return
		}
	}
	http.Error(w, "Celebrity not found: ", http.StatusNotFound)
}

func DeleteCelebrity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	for i, celeb := range CelebrityList {
		if id == fmt.Sprintf("%d", celeb.Id) {
			CelebrityList = append(CelebrityList[:i], CelebrityList[i+1:]...)
			SaveShanges()
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}
	http.Error(w, "Celebrity not found", http.StatusNotFound)
}
