
const testValues = [
	"Host(`example.local`)",
	"Host(`foo.example.local`) || Host(`bar.example.local`)",
	"HOST(`foo.example.local`) || ( Host(`baz.example.local`) && Path(`/baz`) )",
	"Host(`bill.example.local`) || ( Path(`/ben`) && Host(`ben.example.local`) )",
	"Host( `foo.local`, `bar.local`)"
]

const re = /Host\(\s*`(.*?\.local)`\s*,*\s*\)/gi
const re2 = /`(.*?\.local)`/g

testValues.forEach( l => {
	if (re.test(l)) {
		re.lastIndex = 0
		const matches = [...l.matchAll(re)]
		for (const match of matches) {
			if (match[1].includes(',')){
				const parts = match[0].matchAll(re2)
				for (const part of parts){
					console.log(part[1])
				}
			} else {
				console.log(match[1])
			}
		}
	} else {
		console.log("no match - " + l )
	}
})
