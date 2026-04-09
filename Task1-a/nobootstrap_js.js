//let devices = [ ];
let devices=[{ id: 1, name: "Samsung A50" },{ id: 2, name: "LG G8 ThinQ" },{ id: 3, name: "Huawei P30" },{ id: 4, name: "Iphone 13" },{ id: 5, name: "Iphone 14 pro" } ];

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const addBtn = document.getElementById("addBtn");
const tableBody = document.getElementById("deviceTableBody");

// Render device rows
function render(devicesToRender) {
    tableBody.innerHTML = "";
    devicesToRender.forEach(device => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${device.id}</td><td>${device.name}</td>`;
        tableBody.appendChild(row);
    });
}

render(devices);

// Add Button
addBtn.addEventListener("click", () => {
    const name = searchInput.value.trim();
    if (name === "") return alert("Enter a device name to add");

    const exists = devices.some(device => device.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert("Device name already exists!");
        return;
    }

    const nextId = devices.length > 0 ? devices[devices.length - 1].id + 1 : 1;
    devices.push({ id: nextId, name });

    searchInput.value = "";
    render(devices);
});

// Search Button
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = devices.filter(d => d.name.toLowerCase().includes(query));
    render(filtered);
});
