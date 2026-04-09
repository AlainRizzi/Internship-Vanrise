let devices = [
    { id: 1, name: "Samsung A50" },
    { id: 2, name: "iPhone 13" },
    { id: 3, name: "iPhone 14 Pro" },
    { id: 4, name: "Huawei P30" },
    { id: 5, name: "LG G8 ThinQ" }
];
//let devices=[];

const input = document.getElementById("deviceInput");
const searchBtn = document.getElementById("searchBtn");
const addBtn = document.getElementById("addBtn");
const tableBody = document.getElementById("deviceTableBody");

function render(devicesToRender) {
    tableBody.innerHTML = "";
    devicesToRender.forEach(device => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${device.id}</td><td>${device.name}</td>`;
        tableBody.appendChild(row);
    });
}

render(devices);

addBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (name === "") {
        alert("Enter a device name.");
        return;
    }
    const exists = devices.some(device => device.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert("Device name already exists!");
        return;
    }

    const nextId = devices.length > 0 ? devices[devices.length - 1].id + 1 : 1;
    devices.push({ id: nextId, name });

    input.value = "";
    render(devices);
});

searchBtn.addEventListener("click", () => {
    const query = input.value.trim().toLowerCase();
    const filtered = devices.filter(device =>
        device.name.toLowerCase().includes(query)
    );
    render(filtered);
});
