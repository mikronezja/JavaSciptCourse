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

request.onsuccess = function (event) {
    db = event.target.result;
    document.getElementById("dodaj").disabled = false;
    document.getElementById("usun").disabled = false;
    document.getElementById("wyswietl").disabled = false;

    // data base has loaded
    let main = document.querySelector('main');
    hotel_rooms.forEach((value, key) => {

        const transaction = db.transaction("Reservations", "readonly");
        const store = transaction.objectStore("Reservations");
        const roomIndex = store.index("roomNumber");

        const countGuestsInRoom = roomIndex.count(String(key));
        countGuestsInRoom.onsuccess = function()
        {
            let card = document.createElement("div");
            // adding classes to card
            card.classList.add("card", "col-lg-5", "mx-5", "my-5");

            // things inside of a card 
            // img
            let img = document.createElement("img");
            img.id = "room-" + key; 
            img.src = "public/hotel_room.jpg";
            img.classList.add("card-img-top");
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
                img.style.opacity = 0.4;
            }
            
            main.appendChild(card);
            main.classList.add("d-flex", "justify-content-center", "row");
        }

        countGuestsInRoom.onerror = function ()
        {
            window.alert("Error with making db index!")
        }

    })

};

function addReservations(event) {
    event.preventDefault();
    const textForm = document.forms.reserve.text_field; 
    const [room, guest] = splitAfterFirstSpace(textForm.value)

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
        }

        if(countGuestsInRoom.result < hotel_rooms.get(parseInt(room))[0]){
            const addRequest = store.add({room, guest});

            addRequest.onsuccess = function () {
                window.alert("Rezerwacja dodana");
                
                if (countGuestsInRoom.result + 1 === hotel_rooms.get(parseInt(room))[0])
                {
                    document.getElementById("room-" + room).style.opacity = 0.4;
                }

                document.forms.reserve.reset();
            };
    
            addRequest.onerror = function () {
                window.alert("[ERROR] w dodawaniu rezerwacji");
            };
        }
        else {
            window.alert("Pokój już zajęty")
        }
    }
}

function deleteReservation(event) {
    event.preventDefault();
    const textForm = document.forms.reserve.text_field; 
    const [room, guest] = splitAfterFirstSpace(textForm.value)

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
        deleteRequest.onsuccess = function () {
            window.alert("Rezerwacja usunięta");
            document.getElementById("room-" + room).style.opacity = 1;
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
        console.log("[ERROR] Błąd przy wyświetlaniu");
    }

}

function splitAfterFirstSpace(str) {
    let index = str.indexOf(" ");
    return index !== -1 ? [str.slice(0, index), str.slice(index + 1)] : [str, ""];
}