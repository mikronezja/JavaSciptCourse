function display(event) { // zaladuje wszystkie dane
    event.preventDefault();
    
    const textField = document.getElementById("text_field");
    const room = textField.value.trim();
    
    // request 
    const requestData = {
        room: room
    };
    
    // POST request
    fetch('/display', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error || `${response.error}`);
            }
            return data;
        });
    })
    .then(data => {
        const display_div = document.getElementById("display");
        const existingDisplay = document.getElementById("guest_list_display");
        
        if (existingDisplay) { 
            existingDisplay.remove(); 
        }
        
        const displayContainer = document.createElement("div");
        displayContainer.id = "guest_list_display";
        displayContainer.className = "m-3 d-flex flex-column align-items-center";
        
        //
        data.forEach((record) => {
            const room = record.room;
            const names = record.guests;
            
            const title = document.createElement("h4");
            title.innerText = `Lista gości w pokoju ${room}`;
            displayContainer.appendChild(title);
            
            if (!names || names.length === 0) {
                const message = document.createElement("p");
                message.innerText = "Brak rezerwacji w tym pokoju";
                displayContainer.appendChild(message);
            } else {
                names.forEach((name) => {
                    const guest = document.createElement("p");
                    guest.innerText = name;
                    displayContainer.appendChild(guest);
                });
            }
        });
        
        display_div.appendChild(displayContainer);
    })
    .catch(error => {
        window.alert(error.message);
    });
}


function load(event)
{
    event.preventDefault();

    fetch('/load')
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error || `${response.error}`);
            }
            return data;
        });
    })
    .then(data => {
        document.getElementById("dodaj").disabled = false;
        document.getElementById("usun").disabled = false;
        document.getElementById("wyswietl").disabled = false;

        // database has loaded
        const main = document.querySelector('main');
        const cont = document.createElement("div");
        cont.classList.add("d-flex","gap-4","mx-4","flex-wrap", "justify-content-center", "align-items-center");

        const max_rooms = data.maxData;
        const current_data = data.currentData;
        console.log("Max rooms:", max_rooms);
        console.log("Current data:", current_data);

        max_rooms.forEach((maxRoom, index) => {
            const { room, number_of_places } = maxRoom; // maxRoom ma room i number_of_places
            
            const currentRoom = current_data.find(currentData => currentData.room === room);
            
            if (currentRoom) {
                const { guests } = currentRoom;
                
                const card = document.createElement("div");
                card.classList.add("card", "col-lg-4");
                
                // img
                const img = document.createElement("img");
                img.id = "room-" + room;
                img.src = "hotel_room.jpg";
                img.classList.add("card-img-top", "img-fluid");
                card.appendChild(img);                    

                const cardBody = document.createElement("div");
                cardBody.classList.add("card-body");
                card.appendChild(cardBody);

                const cardContent = document.createElement("div");
                cardContent.classList.add("table-responsive-lg", "d-flex", "justify-content-center");
                cardBody.appendChild(cardContent);

                const room_elem = document.createElement("h3");
                room_elem.innerText = "Pokój numer " + room; 
                cardContent.appendChild(room_elem);


                if (guests.length >= number_of_places) {
                    img.style.opacity = "0.4";
                }

                cont.appendChild(card);
            }
        });
        
        main.appendChild(cont);
    })
    .catch(error => {
        console.error("Load error:", error);
        window.alert(error.message);
    });
}

function addReservations(event)
{
    event.preventDefault();
    const textField = document.getElementById("text_field");
    const [room, guest] = splitAfterFirstSpace(textField.value);
    
    const requestData = {
        room: parseInt(room),
        guest: guest
    };    

    // POST request
    fetch('/addReservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error || `${response.error}`);
            }
            return data;
        });
    })
    .then(data => {
        // if data = 0 added
        // if data = 1 added but not remaining space
        if (parseInt(data) === 1)
        {
            document.getElementById("room-" + room).style.opacity = 0.4;
        }
        window.alert('Reservation added!');

    })
    .catch(error => {
        window.alert(error.message);
    });    
}

function deleteReservation(event)
{
    event.preventDefault();
    const textField = document.getElementById("text_field");
    const [room, guest] = splitAfterFirstSpace(textField.value);
    
    const requestData = {
        room: parseInt(room),
        guest: guest
    };
    
    fetch('/deleteReservation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error || `${response.error}`);
            }
            return data;
        });
    })
    .then(data => {
        document.getElementById("room-" + room).style.opacity = 1;
        window.alert('Reservation deleted!');
    })
    .catch(error => {
        window.alert(error.message);
    });        

}

function splitAfterFirstSpace(str) {
    let index = str.indexOf(" ");
    return index !== -1 ? [str.slice(0, index), str.slice(index + 1)] : [str, ""];
}

// Add this to automatically load data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create a fake event object since load() expects an event parameter
    const fakeEvent = { preventDefault: () => {} };
    load(fakeEvent);
});