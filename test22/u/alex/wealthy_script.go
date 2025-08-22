package inner

import (
	"fmt"
	wmill "github.com/windmill-labs/windmill-go-client"
	"rsc.io/quote"
)

// Pin dependencies partially in go.mod with a comment starting with "//require":
//require rsc.io/quote v1.5.1

// the main must return (interface{}, error)

func main(x string, nested struct {
	Foo string `json:"foo"`
}) (interface{}, error) {
	fmt.Println("Hello, World")
	fmt.Println(nested.Foo)
	fmt.Println(quote.Opt())
	// v, _ := wmill.GetVariable("f/examples/secret")
	return x, nil
}
