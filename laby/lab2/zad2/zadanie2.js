function sum(x,y) {
    return x+y;
}
// a - tablica napisow 
function sum_strings(a)
{
    let sum = 0;
    for (let string of a)
    {
        if (string.length > 1 && !isNaN( string[0] ))
        {
            let i = 0;
            let value = 0;
            while ( i < string.length && !isNaN( string[i] ) )
            {
                value *= 10;
                value += parseInt(string[i]);
                ++i;
            }
            sum += value
        } 
    }
    return sum;
}

// suma cyfr nieparzystych, suma cyfr parzystych w stringu 
function digits(s)
{
    let odd = 0;
    let even = 0;
    for(let i = 0; i < s.length; ++i)
    {
        if ( ! isNaN(s[i]) )
        {
        let number = Number(s[i]);
        if ( number % 2 === 0)
        {
            even += number;
        }
        else 
        {
            odd += number;
        }
        }
    }

    return [odd, even];
}

function letters(s)
{
    // ilosc malych liter, ilosc duzych liter
    let lowercaseNumber = 0;
    let uppercaseNumber = 0;

    for(let i = 0; i < s.length; ++i)
    {
        if ( s[i].toLowerCase() != s[i].toUpperCase() )
        {
        if ( s[i] === s[i].toUpperCase())
        {
            uppercaseNumber +=1 ;
        }
        else if( s[i] === s[i].toLowerCase() )
        {
            lowercaseNumber +=1 ;
        }
        }
    }

    return [lowercaseNumber, uppercaseNumber];
}