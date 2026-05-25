package celebrity_lib

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/graphql-go/graphql"
	_ "github.com/jackc/pgx/v5/stdlib"
)

type Celebrity struct {
	Id           int    `json:"id"`
	FullName     string `json:"fullName"`
	Nationality  string `json:"nationality"`
	ReqPhotoPath string `json:"reqPhotoPath"`
}

var db *sql.DB
var schema graphql.Schema

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

func InitGraphQL() error {
	celebrityType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Celebrity",
		Fields: graphql.Fields{
			"id":           &graphql.Field{Type: graphql.Int},
			"fullName":     &graphql.Field{Type: graphql.String},
			"nationality":  &graphql.Field{Type: graphql.String},
			"reqPhotoPath": &graphql.Field{Type: graphql.String},
		},
	})

	query := graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"celebrities": &graphql.Field{
				Type: graphql.NewList(celebrityType),
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					items, err := GetAllCelebrities()
					return celebrityMaps(items), err
				},
			},
			"celebrity": &graphql.Field{
				Type: celebrityType,
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Int)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					item, err := GetCelebrityById(p.Args["id"].(int))
					return celebrityMap(item), err
				},
			},
		},
	})

	mutation := graphql.NewObject(graphql.ObjectConfig{
		Name: "Mutation",
		Fields: graphql.Fields{
			"createCelebrity": &graphql.Field{
				Type: celebrityType,
				Args: graphql.FieldConfigArgument{
					"id":           &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Int)},
					"fullName":     &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"nationality":  &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"reqPhotoPath": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					item := Celebrity{
						Id:           p.Args["id"].(int),
						FullName:     p.Args["fullName"].(string),
						Nationality:  p.Args["nationality"].(string),
						ReqPhotoPath: p.Args["reqPhotoPath"].(string),
					}
					created, err := PostCelebrity(item)
					return celebrityMap(created), err
				},
			},
			"updateCelebrity": &graphql.Field{
				Type: celebrityType,
				Args: graphql.FieldConfigArgument{
					"id":           &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Int)},
					"fullName":     &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"nationality":  &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"reqPhotoPath": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					item := Celebrity{
						Id:           p.Args["id"].(int),
						FullName:     p.Args["fullName"].(string),
						Nationality:  p.Args["nationality"].(string),
						ReqPhotoPath: p.Args["reqPhotoPath"].(string),
					}
					updated, err := PutCelebrity(item)
					return celebrityMap(updated), err
				},
			},
			"deleteCelebrity": &graphql.Field{
				Type: graphql.Boolean,
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Int)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					return DeleteCelebrity(p.Args["id"].(int))
				},
			},
		},
	})

	var err error
	schema, err = graphql.NewSchema(graphql.SchemaConfig{Query: query, Mutation: mutation})
	return err
}

func GraphQLHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Query     string                 `json:"query"`
		Variables map[string]interface{} `json:"variables"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid graphql request", http.StatusBadRequest)
		return
	}

	result := graphql.Do(graphql.Params{
		Schema:         schema,
		RequestString:  req.Query,
		VariableValues: req.Variables,
	})

	status := http.StatusOK
	if len(result.Errors) > 0 {
		status = http.StatusBadRequest
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(result)
}

func GetAllCelebrities() ([]Celebrity, error) {
	rows, err := db.Query("SELECT id, fullName, nationality, reqPhotoPath FROM celebrities ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []Celebrity
	for rows.Next() {
		var item Celebrity
		rows.Scan(&item.Id, &item.FullName, &item.Nationality, &item.ReqPhotoPath)
		items = append(items, item)
	}
	return items, rows.Err()
}

func GetCelebrityById(id int) (Celebrity, error) {
	var item Celebrity
	err := db.QueryRow(
		"SELECT id, fullName, nationality, reqPhotoPath FROM celebrities WHERE id=$1", id).
		Scan(&item.Id, &item.FullName, &item.Nationality, &item.ReqPhotoPath)

	if errors.Is(err, sql.ErrNoRows) {
		return item, errors.New("Celebrity not found")
	}
	return item, err
}

func PostCelebrity(item Celebrity) (Celebrity, error) {
	_, err := db.Exec(
		"INSERT INTO celebrities (id, fullName, nationality, reqPhotoPath) VALUES ($1,$2,$3,$4)",
		item.Id, item.FullName, item.Nationality, item.ReqPhotoPath)

	if err != nil {
		return item, errors.New("Celebrity with this ID already exists")
	}
	return item, nil
}

func PutCelebrity(item Celebrity) (Celebrity, error) {
	res, err := db.Exec(
		"UPDATE celebrities SET fullName=$1, nationality=$2, reqPhotoPath=$3 WHERE id=$4",
		item.FullName, item.Nationality, item.ReqPhotoPath, item.Id)
	if err != nil {
		return item, err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return item, errors.New("Celebrity not found")
	}
	return item, nil
}

func DeleteCelebrity(id int) (bool, error) {
	res, err := db.Exec("DELETE FROM celebrities WHERE id=$1", id)
	if err != nil {
		return false, err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return false, errors.New("Celebrity not found")
	}
	return true, nil
}

func celebrityMap(item Celebrity) map[string]interface{} {
	return map[string]interface{}{
		"id":           item.Id,
		"fullName":     item.FullName,
		"nationality":  item.Nationality,
		"reqPhotoPath": item.ReqPhotoPath,
	}
}

func celebrityMaps(items []Celebrity) []map[string]interface{} {
	var result []map[string]interface{}
	for _, item := range items {
		result = append(result, celebrityMap(item))
	}
	return result
}
