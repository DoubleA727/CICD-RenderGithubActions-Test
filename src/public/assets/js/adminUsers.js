const API = "/api/admin/users";

const tbody = document.querySelector("#usersTable tbody");
const alertBox = document.querySelector("#alertContainer");
const usersMeta = document.querySelector("#usersMeta");

const refreshBtn = document.querySelector("#refreshBtn");

const editModalEl = document.getElementById("editUserModal");
const editForm = document.getElementById("editUserForm");

const searchInput = document.querySelector("#searchInput");


const f = {
  id: document.getElementById("editUserId"),
  username: document.getElementById("editUsername"),
  firstName: document.getElementById("editFirstName"),
  lastName: document.getElementById("editLastName"),
  email: document.getElementById("editEmail"),
  role: document.getElementById("editRole"),
  password: document.getElementById("editPassword"),
};

let users = [];
let modal;

function applySearch() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  if (!q) return render(users);

  const filtered = users.filter(u =>
    String(u.userId).includes(q) ||
    (u.username || "").toLowerCase().includes(q) ||
    (u.email || "").toLowerCase().includes(q)
  );

  render(filtered);
}


function token() {
  return localStorage.getItem("token");
}

function headers(json = false) {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token()}`,
  };
}

function alert(msg, type = "success") {
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${msg}
      <button class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function render(list) {
  tbody.innerHTML = "";

  list.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.userId}</td>
      <td>${u.username}</td>
      <td>${u.firstName} ${u.lastName}</td>
      <td>${u.email}</td>
      <td><span class="badge bg-${u.role === "admin" ? "primary" : "secondary"}">${u.role}</span></td>
      <td>${new Date(u.createdAt).toLocaleString()}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-2" data-edit="${u.userId}">Edit</button>
        <button class="btn btn-sm btn-outline-danger" data-del="${u.userId}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  usersMeta.textContent = `${list.length} user(s)`;
}

async function load() {
  const res = await fetch(API, { headers: headers() });
  if (!res.ok) throw new Error("Failed to load users");

  users = await res.json();
  applySearch();
}

function openEdit(id) {
  const u = users.find(x => x.userId == id);
  if (!u) return;

  f.id.value = u.userId;
  f.username.value = u.username;
  f.firstName.value = u.firstName;
  f.lastName.value = u.lastName;
  f.email.value = u.email;
  f.role.value = u.role;
  f.password.value = "";

  modal = modal || new bootstrap.Modal(editModalEl);
  modal.show();
}

async function save(e) {
  e.preventDefault();

  const id = f.id.value;
  const body = {
    username: f.username.value || undefined,
    firstName: f.firstName.value || undefined,
    lastName: f.lastName.value || undefined,
    email: f.email.value || undefined,
    role: f.role.value,
  };

  if (f.password.value) body.password = f.password.value;

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: headers(true),
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Update failed");

  modal.hide();
  alert("User updated");
  load();
}

async function del(id) {
  if (!confirm(`Delete user ${id}?`)) return;

  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: headers(),
  });

  if (!res.ok) throw new Error("Delete failed");

  alert("User deleted", "warning");
  load();
}

tbody.addEventListener("click", e => {
  if (e.target.dataset.edit) openEdit(e.target.dataset.edit);
  if (e.target.dataset.del) del(e.target.dataset.del).catch(err => alert(err.message, "danger"));
});

editForm.addEventListener("submit", e => {
  save(e).catch(err => alert(err.message, "danger"));
});

refreshBtn.addEventListener("click", () => load().catch(err => alert(err.message, "danger")));

document.addEventListener("DOMContentLoaded", () => {
  load().catch(err => alert(err.message, "danger"));
});

searchInput?.addEventListener("input", applySearch);
