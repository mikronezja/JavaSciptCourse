import fs from 'node:fs';
import { exec } from 'node:child_process';
import readline from 'node:readline'
/// 

/**
 * Zapisanie do pliku (zwiekszenie licznika) z wykorzystaniem funkcji synchroncznej
 */
function execute_sync()
{
    const data = fs.readFileSync("./src/counter.txt");
    console.log("Liczba uruchomień:", data.toString());
    fs.writeFileSync("./src/counter.txt", (parseInt(data)+1).toString());
}


/**
 * Zapisanie do (zwiekszenie licznika) z wykorzystaniem funkcji asynchroncznej
 */
function execute_async()
{
    fs.readFile("./src/counter.txt", "utf-8" , (error, data) => {
        if (error)
        {
            console.log(error);
            return;
        }
        else
        {
            /**
             * Jeżeli nie wystąpi błąd to zapisanie do pliku
             */
            console.log("Liczba uruchomień:", data.toString());
            fs.writeFile("./src/counter.txt", (parseInt(data)+1).toString(), () => {
                    if(error)
                    {
                        console.log(error);
                        return;
                    }
            } )
        }
    })
}
/**
 * Funkcja wywołująca w konsoli (cmd) to, co napisał użytkownik
 * @param {string} line - linia komend ktora ma być przekazana przez użytkownika
 */
function execute_command(line)
{
    exec(line, (err, output) => {
        if (err)
        {
            console.log(err.message);
            process.exit(0);
        }
        else
        {
            /**
             * Napisanie w konsoli to, co zostało otrzymane za pomocą funkcji exec
             */
            console.log(output);
        }
    })
}

/**
 * Funkcja, która zostaje wywołana, gdy użytkownik skorzysta z opcji pisania w konsoli
 */
function system_commands()
{
    console.log("Wprowadź komendy — naciśnięcie Ctrl+D kończy wprowadzanie danych");
    
    let rl = readline.createInterface({
		input: process.stdin, 
        output: process.stdout, 
        prompt: ''
    });

    /**
     * Jeżeli wpiszemy linie, mają być wykonywane komendy systemowe 
     */
    rl.on('line', async (line) => {

        const command = line.trim();

        if (command) {
        execute_command(command);
        }
        rl.prompt();
    })

    rl.on('close', () => {
        process.exit(0);
    })

}

/************************* */

/**
 * @param {string} args - pokazuje z ktora opcja ma być wywoływana nasza funkcja, tzn w jaki sposób ma być wywoływana
 */
const args = process.argv.slice(2);
if ( args.length === 0 )
{
    system_commands();
}
else if(args[0] === '--sync')
{
    execute_sync();
}
else if(args[0] === '--async')
{
    execute_async()
}