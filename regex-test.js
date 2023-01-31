
const testValues = [
	"Host(`example.local`)",
	"Host(`foo.example.local`) || Host(`bar.example.local`)",
	"HOST(`foo.example.local`) || ( Host(`baz.example.local`) && Path(`/baz`) )",
	"Host(`bill.example.local`) || ( Path(`/ben`) && Host(`ben.example.local`) )",
	"Host( `foo.local`, `bar.local`)",
	"Host(`example.com`)",
	"Host(`foo.example.com`) || Host(`bar.example.local`)",
	"HOST(`foo.example.local`) || ( Host(`baz.example.com`) && Path(`/baz`) )",
	"Host(`bill.example.com`) || ( Path(`/ben`) && Host(`ben.example.local`) )",
	"Host( `foo.com`, `bar.local`)"
]

const checkRe = /Host\(\s*`(.*?\.local)`\s*,*\s*\)/gi
const domainRe = /`(?<domain>[^`]*?\.local)`/g

const matchDomainCnames = function (domainString) {
	return [...domainString.matchAll(domainRe)].map(match => match.groups.domain)
}

testValues.forEach( l => {
	if (checkRe.test(l)) {
		checkRe.lastIndex = 0
		console.log(matchDomainCnames(l))
	} else {
		console.log("no match - " + l )
	}
})
