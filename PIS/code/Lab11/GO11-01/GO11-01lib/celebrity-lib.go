package celebrity_lib

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	_ "github.com/jackc/pgx/v5/stdlib"
)

type Celebrity struct {
	Id           int    `json:"id"`
	FullName     string `json:"fullName"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `json:"reqPhotoPath"`
}

var db *sql.DB

func InitDB() error {
	const conn string = "host=localhost user=postgres password=postgres dbname=db port=5432 sslmode=disable"

	var err error
	db, err = sql.Open("pgx", conn)
	if err != nil {
		return err
	}

	if err = db.Ping(); err != nil {
		return err
	}

	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS celebrities (
		id INTEGER PRIMARY KEY,
		fullName TEXT,
		nationality TEXT,
		reqPhotoPath TEXT
	);`)
	return err
}

func CloseDB() {
	if db != nil {
		db.Close()
	}
}

func GetAllCelebrities(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, fullName, nationality, reqPhotoPath FROM celebrities ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []Celebrity
	for rows.Next() {
		var item Celebrity
		rows.Scan(&item.Id, &item.FullName, &item.Nationality, &item.ReqPhotoPath)
		items = append(items, item)
	}

	writeJSON(w, http.StatusOK, items)
}

func GetCelebrityById(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	item, err := findCelebrity(id)
	if err != nil {
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func PostCelebrity(w http.ResponseWriter, r *http.Request) {
	var item Celebrity
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	_, err := db.Exec(
		"INSERT INTO celebrities (id, fullName, nationality, reqPhotoPath) VALUES ($1,$2,$3,$4)",
		item.Id, item.FullName, item.Nationality, item.ReqPhotoPath)
	if err != nil {
		http.Error(w, "Celebrity with this ID already exists", http.StatusConflict)
		return
	}

	writeJSON(w, http.StatusCreated, item)
}

func PutCelebrity(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var item Celebrity
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	item.Id = id

	res, err := db.Exec(
		"UPDATE celebrities SET fullName=$1, nationality=$2, reqPhotoPath=$3 WHERE id=$4",
		item.FullName, item.Nationality, item.ReqPhotoPath, item.Id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func DeleteCelebrity(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	res, err := db.Exec("DELETE FROM celebrities WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		http.Error(w, "Celebrity not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func OpenAPIHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(openAPISpec))
}

func findCelebrity(id int) (Celebrity, error) {
	var item Celebrity
	err := db.QueryRow(
		"SELECT id, fullName, nationality, reqPhotoPath FROM celebrities WHERE id=$1", id).
		Scan(&item.Id, &item.FullName, &item.Nationality, &item.ReqPhotoPath)

	if errors.Is(err, sql.ErrNoRows) {
		return item, errors.New("Celebrity not found")
	}
	return item, err
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

const openAPISpec = `{
  "openapi": "3.0.3",
  "info": {
    "title": "GO11-01 Celebrities API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:3000"
    }
  ],
  "paths": {
    "/Celebrities/All": {
      "get": {
        "summary": "Get all celebrities",
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/Celebrities": {
      "post": {
        "summary": "Create celebrity",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Celebrity"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created"
          }
        }
      }
    },
    "/Celebrities/{id}": {
      "get": {
        "summary": "Get celebrity by id",
        "parameters": [
          {
            "$ref": "#/components/parameters/Id"
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "404": {
            "description": "Not found"
          }
        }
      },
      "put": {
        "summary": "Update celebrity",
        "parameters": [
          {
            "$ref": "#/components/parameters/Id"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CelebrityInput"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          },
          "404": {
            "description": "Not found"
          }
        }
      },
      "delete": {
        "summary": "Delete celebrity",
        "parameters": [
          {
            "$ref": "#/components/parameters/Id"
          }
        ],
        "responses": {
          "204": {
            "description": "Deleted"
          },
          "404": {
            "description": "Not found"
          }
        }
      }
    }
  },
  "components": {
    "parameters": {
      "Id": {
        "name": "id",
        "in": "path",
        "required": true,
        "schema": {
          "type": "integer"
        }
      }
    },
    "schemas": {
      "Celebrity": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "fullName": {
            "type": "string"
          },
          "nationality": {
            "type": "string"
          },
          "reqPhotoPath": {
            "type": "string"
          }
        }
      },
      "CelebrityInput": {
        "type": "object",
        "properties": {
          "fullName": {
            "type": "string"
          },
          "nationality": {
            "type": "string"
          },
          "reqPhotoPath": {
            "type": "string"
          }
        }
      }
    }
  }
}`
