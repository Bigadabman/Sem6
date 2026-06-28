package P03_02

import "fmt"

type MethodCounter struct {
	postCounter, getCounter int16
}


func (c *MethodCounter) PlusGet() {
	c.getCounter += 1
}

func (c *MethodCounter) PlusPost() {
	c.postCounter += 1
}

func (c *MethodCounter) GenStr() string {
	genString := fmt.Sprintf("Get-request count = %d Post-request count = %d", c.getCounter, c.postCounter)
	return genString
}