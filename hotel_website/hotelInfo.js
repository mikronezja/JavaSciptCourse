// zahardkodowane informacje o pokojach
const hotel_rooms = new Map();
// nr pokoju    [liczba miejsc w pokoju, aktualna liczba gosci w pokoju]
hotel_rooms.set(1,[2,0])
hotel_rooms.set(2,[3,0])
hotel_rooms.set(3,[1,0]) 

const guests = ["Jan Kowalski", "Adam Adamczyk", "Katarzyna Kowalczyk", "Tomasz Kot"]

// IndexDB
let db; // database
const request = indexedDB.open("HotelReservations", 7); // 1 - wersja bazy danych

request.onerror = (event) => {
  window.alert(`Database error: ${event.target.error?.message}`);
};

request.onupgradeneeded = function () {
    db = request.result;

    if (!db.objectStoreNames.contains("Reservations")) {
        const store = db.createObjectStore("Reservations", { keyPath: "id", autoIncrement: true });
        store.createIndex("roomNumber", "room", { unique: false });
        store.createIndex("roomNumberGuest", ["room", "guest"], { unique: false });
    }
};

let draggedRoom = "";

request.onsuccess = function (event) {
    db = event.target.result;

    // data base has loaded
    let main = document.querySelector('main');
    hotel_rooms.forEach((value, key) => {

        const transaction = db.transaction("Reservations", "readonly");
        const store = transaction.objectStore("Reservations");
        const roomIndex = store.index("roomNumber");

        const countGuestsInRoom = roomIndex.count(String(key));
        countGuestsInRoom.onsuccess = function()
        {
            let cont = document.createElement("div");
            cont.classList.add("row");

            let card = document.createElement("div");
            // adding classes to card
            card.classList.add("card", "col-lg-2","my-3", "col-12", "col-md-6");
            // things inside of a card 
            // img
            let img = document.createElement("img");
            img.id = "room-" + key; 
            img.src = "public/hotel_room.jpg";
            img.draggable = true;
            img.classList.add("card-img-top", "img-fluid");
            card.appendChild(img);
            // card body 
            let cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            card.appendChild(cardBody);

            let cardContent = document.createElement("div");
            cardContent.classList.add("table-responsive-lg", "d-flex", "justify-content-center");
            cardBody.appendChild(cardContent);

            let roomNumber = document.createElement("h3")
            roomNumber.innerText = "Pokój numer " + key;
            cardContent.appendChild(roomNumber);

            if (countGuestsInRoom.result === value[0]) // limit of places!
            {
                img.style.opacity = "0.4";
            }
            else 
            {
                img.setAttribute("data-bs-toggle","modal");
                img.setAttribute("data-bs-target","#staticBackdrop");
            }
            
            cont.appendChild(card);
            main.appendChild(cont);
            img.addEventListener("click", (e) => {
                if (img.style.opacity !== "0.4")
                {
                    document.getElementById("backdropBtn").onclick = () => addReservations(e,String(key)); // it loads the name and surname from textfield!
                }
            });

            img.addEventListener("mouseenter", async () => {
                let container = document.createElement("div");
                container.id = "display_text" + key;
                container.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center",  "col-12", "col-md-6");
                
                try {
                    const texts = await getText(String(key));  // Wait for DB result
                    
                    let maintxt = document.createElement("h3");
                    container.appendChild(maintxt);
                    if(texts.length > 0)
                    {
                        maintxt.textContent = "Lista gości";

                        texts.forEach(element => {
                            let paragraph = document.createElement("p");
                            paragraph.textContent = element;
                            container.appendChild(paragraph);
                        });
                    }
                    else
                    {
                        maintxt.textContent = "Brak gości";
                    }
                    cont.appendChild(container);
                } catch (err) {
                    window.alert("Error fetching text for room:", err);
                }
            });
            img.addEventListener("mouseleave", () => {
                let p = document.getElementById("display_text" + key);
                if( p )
                {
                    p.remove();
                }
            });
            img.addEventListener("dragstart", (e) => {
                draggedRoom = String(key);
            })

            img.addEventListener("dragend", (e) => {
                e.preventDefault();
                draggedRoom = "";
            })
        }

        countGuestsInRoom.onerror = function ()
        {
            window.alert("Error with making db index!")
        }

    })

};

function addReservations(event, room) {
    event.preventDefault();
    const guest = document.getElementById("text_field").value

    if (hotel_rooms.get(parseInt(room)) === undefined)
    {
        window.alert("Taki pokój nie istnieje");
        return;
    }

    if(guests.indexOf(guest) === -1) 
    {
        window.alert("Taki gość nie istnieje");
        return;
    }
    
    if (!db) {
        window.alert("Baza danych nie jest gotowa");
        return;
    }

    const transaction = db.transaction("Reservations", "readwrite");
    const store = transaction.objectStore("Reservations");
    const roomIndex = store.index("roomNumber");
    const roomGuestIndex = store.index("roomNumberGuest")

    if (isNaN(room))
    {
        window.alert("Wypełnij formularz prawidłowo")
        return;
    }

    if (!room || !guest) {
        window.alert("Wypełnij wszystkie pola");
        return;
    }

    // sprawdzic miejsca w pokoju 
    const countGuestsInRoom = roomIndex.count(room);

    countGuestsInRoom.onsuccess = function () 
    {
        const reservation = roomGuestIndex.count([room, guest]);

        reservation.onsuccess = function () 
        {
            if (reservation.result >= 1)
            {
                window.alert("Taka rezerwacja już istnieje");
                return;
            }

            if(countGuestsInRoom.result < hotel_rooms.get(parseInt(room))[0]){
                const addRequest = store.add({room, guest});

                addRequest.onsuccess = function () {
                    window.alert("Rezerwacja dodana");
                    
                    if (countGuestsInRoom.result + 1 === hotel_rooms.get(parseInt(room))[0])
                    {
                        document.getElementById("room-" + room).style.opacity = 0.4;
                        document.getElementById("room-" + room).removeAttribute("data-bs-toggle");
                        document.getElementById("room-" + room).removeAttribute("data-bs-target");
                    }

                    document.getElementById("text_field").value = "";
                };
        
                addRequest.onerror = function () {
                    window.alert("[ERROR] w dodawaniu rezerwacji");
                };
            }
            else {
                window.alert("Pokój już zajęty")
            }
        }

        reservation.onerror = function () 
        {
            window.alert("reservation alert!");
        }
    }
}

function getText(room) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("Reservations", "readonly");
        const store = transaction.objectStore("Reservations");
        const index = store.index("roomNumber");

        const query = index.getAll(room);

        query.onsuccess = function () {
            const resultArray = query.result;

            if (resultArray.length === 0) {
                resolve([]);
            } else {
                // return an array of guest names
                resolve(resultArray.map(res => res.guest));
            }
        };

        query.onerror = function () {
            window.alert("Error when displaying!");
            reject([]);
        };
    });
}

function deleteReservation(event, room) {
    event.preventDefault();
    const textForm = document.getElementById("text_field"); 
    const guest = textForm.value

    if (!db) {
        window.alert("Baza danych nie jest gotowa");
        return;
    }

    const transaction = db.transaction("Reservations", "readwrite");
    const store = transaction.objectStore("Reservations");
    const index = store.index("roomNumberGuest");

    const query = index.getAll([room, guest]);
    query.onsuccess = function() {
        
        const records = query.result;

        if(records.length === 0){
            window.alert("Nie ma takiej rezerwacji");
            return;
        }

        const deleteRequest = store.delete(records[0].id);
        deleteRequest.onsuccess = function () 
        {
            window.alert("Rezerwacja usunięta");
            document.getElementById("room-" + room).style.opacity = 1;

            if(!document.getElementById("room-" + room).hasAttribute("data-bs-toggle"))
            {
                document.getElementById("room-" + room).setAttribute("data-bs-toggle","modal");
                document.getElementById("room-" + room).setAttribute("data-bs-target","#staticBackdrop");
            }
            textForm.value = "";
        }

        deleteRequest.onerror = function () {
            window.alert("[ERROR] w usuwaniu rezerwacji");
        }
    }

    query.onerror = function ()
    {
        window.alert("[ERROR] w wyszukaniu rezerwacji");
    }
}

function display(event) {
    event.preventDefault();
    const textForm = document.forms.reserve.text_field; 
    const room = textForm.value

    if (!db) {
        window.alert("Baza danych nie jest gotowa");
        return;
    }

    if (isNaN(room))
    {
        window.alert("Podaj dobry number pokoju (liczbe)");
        return;
    }

    if (hotel_rooms.get(parseInt(room)) === undefined)
    {
        window.alert("Taki pokoj nie istnieje");
        return;
    }

    const transaction = db.transaction("Reservations", "readonly");
    const store = transaction.objectStore("Reservations");
    const index = store.index("roomNumber");

    const query = index.getAll(room);
    // finish the display function !
    query.onsuccess = function () {

        const resultArray = query.result

        // clear previous query
        const existingDisplay = document.getElementById("guest_list_display");
        if (existingDisplay) { existingDisplay.remove(); }
        
        // result container
        const displayContainer = document.createElement("div");
        displayContainer.id = "guest_list_display";
        displayContainer.className = "m-3 d-flex flex-column align-items-center"

        const title = document.createElement("h4");
        title.innerText = `Lista gości w pokoju ${room}`;
        displayContainer.appendChild(title);

        if (resultArray.length === 0)
        {
            const message = document.createElement("p");
            message.innerText = "Brak rezerwacji w tym pokoju";
            displayContainer.appendChild(message);
        }
        else 
        {
        resultArray.forEach(result => {   
            const guest = document.createElement("p");
            guest.innerText = `${result.guest}`;
            displayContainer.appendChild(guest);
        });
        }

        document.getElementById("display").appendChild(displayContainer);
    }

    query.onerror = function () {
        window.alert("[ERROR] Błąd przy wyświetlaniu");
    }

}

function splitAfterFirstSpace(str) {
    let index = str.indexOf(" ");
    return index !== -1 ? [str.slice(0, index), str.slice(index + 1)] : [str, ""];
}

document.getElementById("bin").addEventListener("dragover", (e) => {
    e.preventDefault();
})

document.getElementById("bin").addEventListener("drop", (e) => {
    e.preventDefault();
    if ( draggedRoom !== "")
    {
        deleteReservation(e, draggedRoom);
    }
    else 
    {
        window.alert("No room is being dragged to bin!");
    }
})