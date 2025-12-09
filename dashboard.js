// Load user name from signup/login
document.getElementById("welcomeName").innerText =
    localStorage.getItem("userName") || "User";

document.getElementById("usernameDisplay").innerText =
    localStorage.getItem("userName") || "User";

// TEMPORARY MOCK DATA (replace later with backend)
const attendanceData = [
    { name: "John Doe", matric: "STU001", time: "08:15 AM", status: "Present" },
    { name: "Sarah James", matric: "STU002", time: "—", status: "Absent" },
    { name: "Michael Ray", matric: "STU003", time: "08:45 AM", status: "Present" }
];

// Load stats
document.getElementById("totalStudents").innerText = attendanceData.length;
document.getElementById("presentToday").innerText =
    attendanceData.filter(s => s.status === "Present").length;
document.getElementById("absentToday").innerText =
    attendanceData.filter(s => s.status === "Absent").length;

// Load table
const table = document.getElementById("attendanceTable");

attendanceData.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.matric}</td>
        <td>${row.time}</td>
        <td class="${row.status === 'Present' ? 'status-present' : 'status-absent'}">
            ${row.status}
        </td>
    `;

    table.appendChild(tr);
});

// Logout
document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "login.html";
};
