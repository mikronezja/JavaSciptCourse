// zahardkodowane informacje o pokojach
const hotel_rooms = new Map();
// nr pokoju    [liczba miejsc w pokoju, aktualna liczba gosci w pokoju]
hotel_rooms.set(1,[2,0])
hotel_rooms.set(2,[3,0])
hotel_rooms.set(3,[1,0]) 

const guests = ["Jan Kowalski", "Adam Adamczyk", "Katarzyna Kowalczyk", "Tomasz Kot"]

// IndexDB
let db; // database
const request = indexedDB.open("HotelReservations", 1); // 1 - wersja bazy danych

request.onerror = (event) => {
  console.error(`Database error: ${event.target.error?.message}`);
};

request.onupgradeneeded = function () {
    db = request.result;

    if (!db.objectStoreNames.contains("Reservations")) {
        const store = db.createObjectStore("Reservations", { keyPath: "id", autoIncrement: true });
        store.createIndex("roomNumber", "room", { unique: false });
        store.createIndex("roomNumberGuest", ["room", "guest"], { unique: false });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    document.getElementById("dodaj").disabled = false;
    document.getElementById("usun").disabled = false;
    document.getElementById("wyswietl").disabled = false;
};

function addReservations(event) {
    event.preventDefault();
    const textForm = document.forms.reserve.text_field; 
    const [room, guest] = splitAfterFirstSpace(textForm.value)

    if (hotel_rooms.get(parseInt(room)) === undefined)
    {
        console.log("Taki pokój nie istnieje");
        return;
    }

    if(guests.indexOf(guest) === -1) 
    {
        console.log("Taki gość nie istnieje");
        return;
    }
    
    if (!db) {
        console.log("Baza danych nie jest gotowa");
        return;
    }

    const transaction = db.transaction("Reservations", "readwrite");
    const store = transaction.objectStore("Reservations");
    const roomIndex = store.index("roomNumber");
    const roomGuestIndex = store.index("roomNumberGuest")

    if (isNaN(room))
    {
        console.log("Wypełnij formularz prawidłowo")
        return;
    }

    if (!room || !guest) {
        console.log("Wypełnij wszystkie pola");
        return;
    }

    // sprawdzic miejsca w pokoju 
    const countGuestsInRoom = roomIndex.count(room)

    countGuestsInRoom.onsuccess = function () 
    {
        const reservation = roomGuestIndex.count([room, guest]);

        reservation.onsuccess = function () 
        {
            if (reservation.result >= 1)
            {
                console.log("Taka rezerwacja już istnieje");
                return;
            }
        }

        if(countGuestsInRoom.result < hotel_rooms.get(parseInt(room))[0]){
            const addRequest = store.add({room, guest});

            addRequest.onsuccess = function () {
                console.log("Rezerwacja dodana");
                document.forms.reserve.reset();
            };
    
            addRequest.onerror = function () {
                console.log("[ERROR] w dodawaniu rezerwacji");
            };
        }
        else {
            console.log("Pokój już zajęty")
        }
    }
}

function deleteReservation(event) {
    event.preventDefault();
    const textForm = document.forms.reserve.text_field; 
    const [room, guest] = splitAfterFirstSpace(textForm.value)

    if (!db) {
        console.log("Baza danych nie jest gotowa");
        return;
    }

    const transaction = db.transaction("Reservations", "readwrite");
    const store = transaction.objectStore("Reservations");
    const index = store.index("roomNumberGuest");

    const query = index.getAll([room, guest]);
    query.onsuccess = function() {
        
        const records = query.result;

        if(records.length === 0){
            console.log("Nie ma takiej rezerwacji");
            return;
        }

        const deleteRequest = store.delete(records[0].id);
        deleteRequest.onsuccess = function () {
            console.log("Rezerwacja usunięta");
        }

        deleteRequest.onerror = function () {
            console.log("[ERROR] w usuwaniu rezerwacji");
        }
    }

    query.onerror = function ()
    {
        console.log("[ERROR] w wyszukaniu rezerwacji");
    }
}

function display(event) {
    event.preventDefault();
    const textForm = document.forms.reserve.text_field; 
    const room = textForm.value

    if (!db) {
        console.log("Baza danych nie jest gotowa");
        return;
    }

    if (isNaN(room))
    {
        console.log("Podaj dobry number pokoju (liczbe)");
        return;
    }

    if (hotel_rooms.get(parseInt(room)) === undefined)
    {
        console.log("Taki pokoj nie istnieje");
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

        document.body.appendChild(displayContainer);
    }

    query.onerror = function () {
        console.log("[ERROR] Błąd przy wyświetlaniu");
    }

}

function splitAfterFirstSpace(str) {
    let index = str.indexOf(" ");
    return index !== -1 ? [str.slice(0, index), str.slice(index + 1)] : [str, ""];
}