function set_styles()
{
    console.log('SET!');

    //
    let div_flex_box = document.getElementsByClassName('flex_box');
    Array.from(div_flex_box).forEach(element => {
        element.style.display = "flex";
        element.style.justifyContent = "space-between";
        element.style.flexWrap = "wrap";
    });

    // 
    let azure = document.getElementsByClassName('azure');
    Array.from(azure).forEach(element => {
        element.style.backgroundColor = "#EFF";
    });

    let pageFragmentStyle = document.getElementsByClassName('page-fragment-style');
    Array.from(pageFragmentStyle).forEach(element => {
        element.style.borderStyle = "solid";
        element.style.borderColor = "#A8A8A8";
        element.style.boxShadow = "0 0 7px black";
    });
    //

    let aside = document.querySelectorAll('aside');
    let footer = document.querySelector('footer');

}

function add()
{
    console.log('ADD!');
}

function remove_styles()
{
    console.log('DELETE!');
}