window.addEventListener("DOMContentLoaded", loadMessages);

function loadMessages() { // zaladuje wszytskie wiadomosci
    fetch('/guest_book')
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("ksiega-gosci");
            container.innerHTML = '';
            data.forEach(({ name, body }) => {
                const entry = document.createElement("div");
                entry.innerHTML = `<h4>${name}</h4><div>${body}</div>`;
                container.appendChild(entry);
            });
        });
}

document.getElementById("guestForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const body = document.getElementById("body").value;

    await fetch('/guest_book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, body })
    });

    loadMessages();
});
