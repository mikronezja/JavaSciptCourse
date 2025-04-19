function setStyles()
{
    document.querySelectorAll('aside').forEach(element => {
        element.style.display = "inline-block";
        element.style.margin = "1% 0";
        element.style.width = "50%";
    });

    // footer
    let footer = document.querySelector('footer');
    if (footer) {
        footer.style.padding = "0.5%";
        footer.style.marginTop = "2%";
    }

    // h1, h2
    document.querySelectorAll('h1, h2').forEach(element => {
        element.style.margin = "0";
        element.style.marginLeft = "1%";
    });

    // main
    document.querySelectorAll('main').forEach(element => {
        element.style.width = "40%";
        element.style.padding = "1% 2% 1% 1%";
        element.style.display = "inline-block";
    });

    // nav
    document.querySelectorAll('nav').forEach(element => {
        element.style.width = "30%";
        element.style.height = "10%";
    });

    // nav ul
    document.querySelectorAll('nav ul').forEach(element => {
        element.style.display = "inline-block";
        element.style.margin = "3% 25px";
        element.style.padding = "7% 2% 7% 15%";
    });

    // blockquote
    document.querySelectorAll('blockquote').forEach(element => {
        element.style.margin = "0";
    });

    // .flex_box
    document.querySelectorAll('.flex_box').forEach(element => {
        element.style.display = "flex";
        element.style.justifyContent = "space-between";
        element.style.flexWrap = "wrap";
    });

    // .azure
    document.querySelectorAll('.azure').forEach(element => {
        element.style.backgroundColor = "#EFF";
    });

    // .page-fragment-style
    document.querySelectorAll('.page-fragment-style').forEach(element => {
        element.style.borderStyle = "solid";
        element.style.borderColor = "#A8A8A8";
        element.style.boxShadow = "0 0 7px black";
    });
}

function add()
{
    let i = 1; 
    while ( i < 4 )
    {
        if ( (document.getElementById("p" + i)) === null)
        {
            let elem = document.createElement("p");
            elem.id = "p" + i;
            let textNode;
            switch (i)
            {
                case 1:
                    textNode = document.createTextNode("Natenczas Wojski chwycił na taśmie przypięty Swój róg bawoli, długi, cętkowany, kręty Jak wąż boa, oburącz do ust go przycisnął, Wzdął policzki jak banię, w oczach krwią zabłysnął, Zasunął wpół powieki, wciągnął w głąb pół brzucha I do płuc wysłał z niego cały zapas ducha, I zagrał: róg jak wicher, wirowatym dechem Niesie w puszczę muzykę i podwaja echem. ");
                    break;
                case 2:
                    textNode = document.createTextNode("Umilkli strzelcy, stali szczwacze zadziwieni Mocą, czystością, dziwną harmoniją pieni. Starzec cały kunszt, którym niegdyś w lasach słynął, Jeszcze raz przed uszami myśliwców rozwinął; Napełnił wnet, ożywił knieje i dąbrowy, Jakby psiarnię w nie wpuścił i rozpoczął łowy.");
                    break;
                case 3:
                    textNode = document.createTextNode("Bo w graniu była łowów historyja krótka: Zrazu odzew dźwięczący, rześki: to pobudka; Potem jęki po jękach skomlą: to psów granie; A gdzieniegdzie ton twardszy jak grzmot: to strzelanie.");
                    document.getElementById("addBtn").disabled = true;
                    break;
                default:
                    console.error("ERROR incorrect i in add function!");
                    return;
            }
            elem.appendChild(textNode);
            document.querySelector("blockquote").appendChild(elem);
            return;
        }
        i++;
    }
}

function deleteStyles(element)
{
    element.removeAttribute('style');
    element.childNodes.forEach(x => {
        if(x.nodeType == 1)
        {
            deleteStyles(x);
        }
    })
}


const setBtn = document.getElementById("setBtn");
const deleteBtn = document.getElementById("deleteBtn");
const addBtn = document.getElementById("addBtn");

setBtn.addEventListener("click", (e) => {
    setStyles();
})

deleteBtn.addEventListener("click", (e) => {
    deleteStyles(document.body);
})

addBtn.addEventListener("click", (e) => {
    add();
})