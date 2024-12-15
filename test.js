blah = ''
console.log(isNaN(blah))

x = NaN

function isFloat(n) {
    return (parseFloat(n) === n && !Number.isInteger(n)) 
}
console.log(isFloat(blah))

console.log(isFloat(x))
