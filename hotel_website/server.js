import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";

/**
 *
 * Wysłuchuje zapytania i je przetwarza
 * @param {IncomingMessage} request -  Strumień wejściowy - zawiera wszytskie dane od przeglądarki
 * @param {ServerResponse} response - Strumień wyjściowy — daj do niego wszytskie dane, ktore chcesz przeslac spowrotem do przeglądarki
 */
function request_listener(request, response) {
    // Tworzy nowy objekt URL
    const url = new URL(request.url, `http://${request.headers.host}`);
    /* *************** */
    /* "Routes" / APIs */
    /* *************** */

    const route = [request.method, url.pathname].join(" ");

    if (url.pathname.startsWith('/public/')) { // wczytanie foldera publicznego
        const filePath = path.join(process.cwd(), url.pathname);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                response.writeHead(404);
                response.end(`File not found: ${url.pathname}`);
                return;
            }
            
            const ext = path.extname(url.pathname).toLowerCase();
            let contentType;
            
            // Mapuje rozszerzenia na konkretne nazwy
            const contentTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.html': 'text/html',
            };
            
            if (contentTypes[ext]) {
                contentType = contentTypes[ext];
            }
            
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(data);
        });
        return;
    }

    switch (route) {
        case "GET /":
            response.writeHead(200, { "Content-Type": "text/html" });

            response.write(
                `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Hotel "Student"</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                    <link href="styles.css" rel="stylesheet"/>
                </head>
                <body>
                    <header class="sticky-top">
                        <nav class="navbar navbar-expand-lg custom-navbar">
                            <div class="container-fluid">
                            <a class="navbar-brand" href="#">
                                <canvas id="logo" width="50" height="50">
                                </canvas>
                            </a>
                                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                    <span class="navbar-toggler-icon"></span>
                                </button>
                                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Oferta
                                        </a>
                                        <ul class="dropdown-menu">
                                        <li><a class="dropdown-item" href="#">Pokoje</a></li>
                                        <div class="dropdown-divider"></div>
                                        <li><a class="dropdown-item" href="#">Restauracja</a></li>
                                        </ul>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="./form.html">Zarezerwuj</a>
                                    </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                    </header>

                    <main>
                        <div class="container my-3 mx-3">
                            <div class="row d-flex justify-content-center">
                                <div class="col-lg-3">
                                    <div class="card">
                                        <img src="public/rynek.jpg" class="card-img-top" alt="">
                                        <div class="card-body">
                                            <div class="table-responsive-lg">
                                                <h3>Dostępne terminy</h3>
                                                <table class="table">
                                                    <thead class="table-dark">
                                                        <th scope="col">Miesiąc</th>
                                                        <th scope="col">Dni</th>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>VII</td>
                                                            <td>14-21, 30-31</td>
                                                        </tr>
                                                        <tr>
                                                            <td>VIII</td>
                                                            <td>1-12</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <button type="button" class="btn btn-primary">Zarezerwuj</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-evenly">
                                <div class="col-lg-3 my-3">
                                    <div class="card w-auto">
                                        <img src="public/hotel_room.jpg" class="card-img-top" alt=""/>
                                        <div class="card-body">
                                            <h5 class="card-title">Ceny noclegu</h5>
                                            <ul>
                                                <li>
                                                    Pokój 1-osobowy - 100zł
                                                </li>
                                                <li>
                                                    Pokój 2-osobowy - 200zł
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-3 my-3">
                                    <div class="card w-auto">
                                        <img src="public/address.jpg" class="card-img-top" alt=""/>
                                        <div class="card-body">
                                            <h5 class="card-title">Adres</h5>
                                            <p class="card-text">ul Popiełuszki 1234</p>
                                            <p class="card-text">30-898 Kraków</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row d-flex justify-content-center">
                                <div class="col-lg-3 my-3">
                                    <div class="card w-auto">
                                        <div class="card-body">
                                            <h5 class="card-title">Atrakcje miasta</h5>
                                            <div class="ratio ratio-16x9">
                                                <iframe
                                                src="https://www.youtube.com/embed/Swd3OsoYRIw?si=iqC6_-iafK6z1Jwr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
                                                </iframe>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    <footer class="footer mt-auto py-3 sticky-bottom">
                        <div class="container-fluid">
                                <div class="row custom-navbar">
                                    <div class="d-flex justify-content-end align-center">
                                        <p class="my-0">&#169; Hotel Studencki</p>
                                    </div>
                                </div>
                                <div class="row d-none d-lg-flex">
                                    <div class="d-flex justify-content-evenly">
                                        <div class="col-md-3 mx-5">
                                            <a href="#">+48 123 465 789</a>
                                        </div>
                                        <div class="col-md-3">
                                            <a href="#">recepcja@studencki</a>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </footer>
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
                    <script type="module">
                        import {draw_crescent} from "./logo.js"
                        draw_crescent();
                    </script>
                </body>
                </html>
                `
            );

            response.end();
            break;
        case "GET /styles.css":
            const filePathCss = path.join(process.cwd(),"styles.css");
            fs.readFile(filePathCss, (err, data) => {
            if (err) {
                response.writeHead(404);
                response.end("Stylesheet nie znaleziony");
                return;
            }
            response.writeHead(200, { "Content-Type": "text/css" });
            response.end(data); // wszystkie dane z css zapisuje
            });
            break;
        case "GET /hotelInfo.js":
            const filePathJS = path.join(process.cwd(), "hotelInfo.js");
            fs.readFile(filePathJS, (err, data) => {
            if (err) {
                response.writeHead(404);
                response.end("Script nie znaleziony");
                return;
            }
            response.writeHead(200, { "Content-Type": "application/javascript" });
            response.end(data);
            });
            break;
        case "GET /logo.js":
            const filePathJSLogo = path.join(process.cwd(), "logo.js");
            fs.readFile(filePathJSLogo, (err, data) => {
            if (err) {
                response.writeHead(404);
                response.end("Script nie znaleziony");
                return;
            }
            response.writeHead(200, { "Content-Type": "application/javascript" });
            response.end(data);
            });
        break;
        case "GET /form.html":
            const filePathForm = path.join(process.cwd(), "form.html");
            fs.readFile(filePathForm, (err, data) => {
                if (err) {
                    response.writeHead(404);
                    response.end("Form page nie znaleziony");
                    return;
                }
                response.writeHead(200, { "Content-Type": "text/html" });
                response.end(data);
            });
            break;
        case "GET /load":
            const filePathCurrentData = path.join(process.cwd(), "current_data.txt");
            const filePathMaxData = path.join(process.cwd(), "max_data.txt");
            
            fs.readFile(filePathCurrentData, 'utf8', (err, data1) => {
                if (err) {
                    response.writeHead(404);
                    response.end("current_data.txt nie znaleziony");
                    return;
                }
                
                fs.readFile(filePathMaxData, 'utf8', (err2, data2) => {
                    if (err2) {
                        response.writeHead(404);
                        response.end("max_data.txt nie znaleziony");
                        return;
                    }

                    const currentData = data1.toString().trim();
                    const maxData = data2.toString().trim();
                    
                    response.writeHead(200, {"Content-Type": "application/json"});
                    
                    response.end(JSON.stringify({
                        currentData: currentData,
                        maxData: maxData
                    }));
                });
            });
            break;
        case "POST /display":
            let displayBody = '';
            
            request.on('data', chunk => {
                displayBody += chunk.toString();
            });
            
            request.on('end', () => {
                try {
                    const data = JSON.parse(displayBody);
                    const roomNumber = data.roomNumber;
                    
                    const currentDataPath = path.join(process.cwd(), 'current_data.txt');
                    
                    fs.readFile(currentDataPath, 'utf8', (err, fileData) => {
                        if (err) {
                            response.writeHead(500, { "Content-Type": "application/json" });
                            response.end(JSON.stringify({ error: "Błąd odczytu danych" }));
                            return;
                        }
                        
                        const result = [];
                        
                        if (roomNumber && roomNumber !== '') {
                            const lines = fileData.trim().split('\n');
                            let found = false;
                            
                            for (const line of lines) {
                                if (line && line.includes(':')) {
                                    const [roomNum, guestsData] = line.split(':');
                                    if (roomNum === roomNumber) {
                                        const guests = guestsData.trim() ? guestsData.split(',') : [];
                                        result.push({ roomNumber: roomNum, guests: guests });
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            
                            if (!found) {
                                response.writeHead(404, { "Content-Type": "application/json" });
                                response.end(JSON.stringify({ error: "Taki pokój nie istnieje" }));
                                return;  
                            }
                        }
                        else
                        {
                            response.writeHead(404, { "Content-Type": "application/json" });
                            response.end(JSON.stringify({ error: "Żaden pokój nie został wpisany" }));
                            return;   
                        }
                        
                        response.writeHead(200, { "Content-Type": "application/json" });
                        response.end(JSON.stringify(result));
                    });
                } catch (e) {
                    response.writeHead(400, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ error: "Zły format" }));
                }
            });          
            break;
            case "POST /addReservations":
                let addRecordBody = '';

                request.on('data', chunk => {
                    addRecordBody += chunk.toString();
                });

                request.on('end', () => {
                    try {
                        const data = JSON.parse(addRecordBody);
                        const roomNumber = data.roomNumber;
                        const guestName = data.guestName;

                        const currentDataPath = path.join(process.cwd(), 'current_data.txt');
                        const maxDataPath = path.join(process.cwd(), 'max_data.txt');
                        const guestPath = path.join(process.cwd(), 'guests.txt');

                        fs.readFile(currentDataPath, 'utf-8', (err1, currentData) => {
                            if (err1) {
                                response.writeHead(500, { "Content-Type": "application/json" });
                                response.end(JSON.stringify({ error: "Nie udało się odczytać pliku current_data.txt" }));
                                return;
                            }

                            fs.readFile(maxDataPath, 'utf-8', (err2, maxData) => {
                                if (err2) {
                                    response.writeHead(500, { "Content-Type": "application/json" });
                                    response.end(JSON.stringify({ error: "Nie udało się odczytać pliku max_data.txt" }));
                                    return;
                                }

                                fs.readFile(guestPath, 'utf-8', (err3, guests) => {
                                    if (err3) {
                                        response.writeHead(500, { "Content-Type": "application/json" });
                                        response.end(JSON.stringify({ error: "Nie udało się odczytać pliku guests.txt" }));
                                        return;
                                    }

                                    const maxLine = maxData.split('\n').find(line => line.startsWith(roomNumber + ":"));
                                    if (!maxLine) {
                                        response.writeHead(400, { "Content-Type": "application/json" });
                                        response.end(JSON.stringify({ error: "Nie znaleziono takiego pokoju" }));
                                        return;
                                    }

                                    const placesLimit = parseInt(maxLine.split(':')[1]);

                                    const currentLines = currentData.split('\n');
                                    const currentLineIndex = currentLines.findIndex(line => line.startsWith(roomNumber + ":"));
                                    let currentGuests = [];

                                    if (currentLineIndex !== -1) {
                                        const guestsData = currentLines[currentLineIndex].split(':')[1];
                                        currentGuests = guestsData ? guestsData.split(',').filter(g => g.trim()) : [];
                                    }

                                    const guestExists = guests.split('\n').some(name => name.trim() === guestName.trim());

                                    if (!guestExists) {
                                        response.writeHead(400, { "Content-Type": "application/json" });
                                        response.end(JSON.stringify({ error: "Taki gość nie istnieje" }));
                                        return;
                                    }

                                    if (currentGuests.length >= placesLimit) {
                                        response.writeHead(400, { "Content-Type": "application/json" });
                                        response.end(JSON.stringify({ error: "Pokój jest już zapełniony" }));
                                        return;
                                    }
                                    
                                    if (currentGuests.includes(guestName.trim())) {
                                        response.writeHead(400, { "Content-Type": "application/json" });
                                        response.end(JSON.stringify({ error: "Ten gość już znajduje się w pokoju" }));
                                        return;
                                    }                                   

                                    currentGuests.push(guestName.trim());
                                    const newLine = `${roomNumber}:${currentGuests.join(',')}`;

                                    if (currentLineIndex !== -1) {
                                        currentLines[currentLineIndex] = newLine;
                                    } else {
                                        currentLines.push(newLine);
                                    }

                                    const newCurrentData = currentLines.join('\n');

                                    fs.writeFile(currentDataPath, newCurrentData, 'utf-8', (err) => {
                                        if (err) {
                                            response.writeHead(500, { "Content-Type": "application/json" });
                                            response.end(JSON.stringify({ error: "Nie udało się zapisać do pliku" }));
                                            return;
                                        }

                                        response.writeHead(200, { "Content-Type": "application/json" });
                                        response.end(JSON.stringify(currentGuests.length === placesLimit ? 1 : 0));
                                    });
                                });
                            });
                        });
                    } catch (e) {
                        response.writeHead(400, { "Content-Type": "application/json" });
                        response.end(JSON.stringify({ error: "Zły format zapytania" }));
                    }
                });
                break;

                case "POST /deleteReservation":
                    let deleteRecordBody = '';

                    request.on('data', chunk => {
                        deleteRecordBody += chunk.toString();
                    });

                    request.on('end', () => {
                        try {
                            const data = JSON.parse(deleteRecordBody);
                            const roomNumber = data.roomNumber;
                            const guestName = data.guestName;

                            const currentDataPath = path.join(process.cwd(), 'current_data.txt');

                            fs.readFile(currentDataPath, 'utf-8', (err, currentData) => {
                                if (err) {
                                    response.writeHead(500, { "Content-Type": "application/json" });
                                    response.end(JSON.stringify({ error: "Nie udało się odczytać pliku current_data.txt" }));
                                    return;
                                }

                                let lines = currentData.split('\n');
                                let roomIndex = lines.findIndex(line => line.startsWith(roomNumber + ":"));

                                if (roomIndex === -1) {
                                    response.writeHead(400, { "Content-Type": "application/json" });
                                    response.end(JSON.stringify({ error: "Pokój nie został odnaleziony" }));
                                    return;
                                }

                                let [room, guestsStr] = lines[roomIndex].split(':');
                                let guests = guestsStr.split(',').map(g => g.trim()); // rozdziela poszczegolnych gosci

                                const updatedGuests = guests.filter(g => g !== guestName);

                                if (guests.length === updatedGuests.length) {
                                    response.writeHead(400, { "Content-Type": "application/json" });
                                    response.end(JSON.stringify({ error: "Ten gość nie został odnaleziony w tym pokoju" }));
                                    return;
                                }

                                if (updatedGuests.length === 0) {
                                    lines.splice(roomIndex, 1);
                                } else {
                                    lines[roomIndex] = `${room}:${updatedGuests.join(',')}`;
                                }

                                fs.writeFile(currentDataPath, lines.join('\n'), 'utf-8', (err) => {
                                    if (err) {
                                        response.writeHead(500, { "Content-Type": "application/json" });
                                        response.end(JSON.stringify({ error: "Nie udało się zaktualizować danych" }));
                                        return;
                                    }

                                    response.writeHead(200, { "Content-Type": "application/json" });
                                    response.end(JSON.stringify({ success: true }));
                                });
                            });
                        } catch (e) {
                            response.writeHead(400, { "Content-Type": "application/json" });
                            response.end(JSON.stringify({ error: "Nieprawidłowy format zapytania" }));
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
/* Główny blok
/* ************************************************** */
const server = http.createServer(request_listener); // Powyzej zdefiniowana funkcja request_listener
server.listen(8000);
console.log("The server was started on port 8000");
console.log('To stop the server, press "CTRL + C"');