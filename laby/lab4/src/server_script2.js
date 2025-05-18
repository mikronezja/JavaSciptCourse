import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
/**
 *
 * Wysłuchuje zapytań i je przetwarza
 * @param {IncomingMessage} request -  Strumień wejściowy - zawiera wszytskie dane od przeglądarki \
 * @param {ServerResponse} response - Strumień wyjściowy — daj do niego wszytskie dane, ktore chcesz przeslac spowrotem do przeglądarki
 */
function request_listener(request, response) {
    // Tworzy nowy objekt URL
    const url = new URL(request.url, `http://${request.headers.host}`);
    /* *************** */
    /* "Routes" / APIs */
    /* *************** */

    const route = [request.method, url.pathname].join(" ");
    switch (route) {
        case "GET /":
            response.writeHead(200, { "Content-Type": "text/html" });
            /* ************************************************** */
            /**
             * Nasza strona sklada sie z tego glownego skryptu htmla
             */
            response.write(`         
                <!DOCTYPE html>
                    <html lang="pl">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                        <title>Księga gości</title>
                    </head>
                    <body>
                        <nav style="margin:10px;">Księga gości</nav>

                        <hr>

                        <div id="ksiega-gosci" style="margin:10px;"></div>

                        <hr>

                        <div style="margin:10px; font-size: 24px;">Nowy wpis:</div>
                        
                        <hr>
                        
                        <form id="guestForm">
                            <div class="flexBox">
                                <label for="name">Twoje imię i nazwisko:</label>
                                <input id="name" placeholder="Jerzy Wiśniewski" required />

                                <label for="body">Treść wpisu:</label>
                                <input type="text" id="body" placeholder="Tutaj wpisz swoją wiadomość" required />

                                <button type="submit" id="btn">Dodaj wpis!</button>
                            </div>
                        </form>

                        <script>
                            window.addEventListener("DOMContentLoaded", loadMessages);

                            function loadMessages() { // zaladuje wszytskie wiadomosci
                                    fetch('/load')
                                        .then(res => res.json())
                                        .then(data => {
                                            const container = document.getElementById("ksiega-gosci");
                                            container.innerHTML = '';
                                            data.forEach(({ name, body }) => {
                                                const entry = document.createElement("div");
                                                
                                                const name_styled = document.createElement("h4");
                                                name_styled.textContent = name;

                                                const body_styled = document.createElement("div");
                                                body_styled.textContent = body;


                                                entry.appendChild(name_styled);
                                                entry.appendChild(body_styled);
                                            
                                                container.appendChild(entry);
                                            });
                                        });
                            }
                            
                            document.getElementById("guestForm").addEventListener("submit", async (e) => {
                                e.preventDefault();
                                const name = document.getElementById("name").value;
                                const body = document.getElementById("body").value;

                                await fetch('/load', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name, body })
                                });

                                loadMessages();
                            });
                        </script>

                        <style>

                        #guestForm
                        {
                        margin:20px;
                        }

                        #btn
                        {
                            width:30%;
                            background-color:orange;
                            border-color: yellow;
                        }

                        .flexBox {
                            display: flex;
                            flex-direction: column;
                            gap: 0.5rem;
                            max-width: 400px;
                        }
                        </style>
                    </body>
                    </html>
                `);
            /* ************************************************** */
            /**
             * Zakończenie przesyłu plików - należy je przekazać spowrotem do przelądarki
             */
            response.end();
            break;
        case "GET /load":
            /**
             * Wywoływane, gdy chcemy wczytać wszystko z pliku 
             */
                fs.readFile("./src/ksiega_gosci.txt", 'utf-8', (err, data) => {
                if (err) {
                    console.error('Błąd podczas odczytu pliku:', err);
                    response.writeHead(500);
                    return response.end('Błąd podczas odczytu pliku');
                }

                /**
                 * Domyslnie w pliku dane sa zapisane w taki sposob
                 * imie:tekst
                 * wobec tego rozdzielamy te dwa, aby je nastepnie sformatowac, aby się ukazały w sformatowanej formie na stronie
                 */
                const entries = data.trim() ? 
                    data.trim().split('\n').map(line => {
                        const [name, body] = line.split(':');
                        return { name, body };
                    }) : [];
                    
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(entries));
            });
            break;
        case "POST /load":
            let body = '';

            /**
             * Lączenie wszyskich elementów
             */
            request.on('data', chunk => {
                body += chunk.toString();
            });
            
            /**
             * Kiedy zakonczy sie POST request - tzn kiedy wszystkie znaki w body będą zapisane
             */
            request.on('end', () => {
                try {
                    /**
                     * body zapisujemy pod inną nazwą
                     */
                    const { name, body: messageBody } = JSON.parse(body);
                    
                    if (!name || !messageBody) {
                        response.writeHead(400, { 'Content-Type': 'application/json' });
                        return response.end(JSON.stringify({ error: 'Imie i text!' }));
                    }

                    const entry = `${name}:${messageBody}\n`;
                    
                    /**
                     * zapisanie do pliku asynchronicznie
                     */
                    fs.appendFile("./src/ksiega_gosci.txt", entry, err => {
                        if (err) {
                            console.error('Error:', err);
                            response.writeHead(500, { 'Content-Type': 'application/json' });
                            return response.end(JSON.stringify({ error: 'nie udalo sie zapisac rekordu' }));
                        }
                        
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ success: true }));
                    });
                } catch (err) {
                    console.error('Error processing request:', err);
                    response.writeHead(400, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: 'zly json' }));
                }
            });
            break;
        default:
            response.writeHead(501, { "Content-Type": "text/plain" });
            response.write("Error 501: nie zaimplementowane");
            response.end();
    }
}

/* ************************************************** */
/* Glowny blok
/* ************************************************** */
const server = http.createServer(request_listener); // Powyzej zdefiniowana funkcja request_listener
server.listen(8000);
console.log("The server was started on port 8000");
console.log('To stop the server, press "CTRL + C"');