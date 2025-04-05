function funkcja_zwrotna()
{
    const info = document.forms.formularz;
    console.log( info.elements.pole_liczbowe.value + ":" + typeof info.elements.pole_liczbowe.value);
    console.log( info.elements.pole_tekstowe.value + ":" + typeof info.elements.pole_tekstowe.value);
}

function count_result() {
    const info = document.forms.formularz;
    const textValue = info.elements.pole_tekstowe.value;
    const numberValue = info.elements.pole_liczbowe.value;

    let sum = 0;
    if (textValue.length > 1 && !isNaN( textValue[0] ))
    {
        let i = 0;
        let value = 0;
        while ( i < textValue.length && !isNaN( textValue[i] ) )
        {
            value *= 10;
            value += parseInt(textValue[i]);
            ++i;
        }
        sum += value
    }

    return sum + Number(numberValue);
}

for(let i = 0; i < 4; ++i)
{
    
let value = window.prompt("Tekst1","Tekst2");
console.log(value + ":" + typeof value); 

}