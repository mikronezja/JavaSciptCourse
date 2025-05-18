import fs from 'node:fs';

console.log("first");

const fileContent = fs.readFileSync("./src/counter.txt", "utf-8");
console.log(fileContent);

console.log("second");

fs.readFile("./src/counter.txt", "utf-8" , (error, data) => {
    if (error)
    {
        console.log(error);
    }
    else{
        console.log(data);
    }
})

console.log("third");


fs.writeFileSync("./src/greet1.txt", "Hello world");


fs.writeFile("./src/greet2.txt", "hediufw",{flag:"a"}, (error) => {
    if(error)
    {
        console.log(error);
    }
    else
    {
        console.log("File wrotten");
    }
})