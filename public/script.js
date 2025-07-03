document.addEventListener("DOMContentLoaded", () => {
  checkSession();
  fetchBooks();

  const bookForm = document.getElementById("add-book-form");
  if (bookForm) {
    bookForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("book-title").value;

      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        document.getElementById("book-title").value = "";
        fetchBooks();
      } else {
        alert("Failed to add book");
      }
    });
  }

  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('full-name').value;
      const city = document.getElementById('city').value;
      const state = document.getElementById('state').value;

      const res = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, city, state })
      });

      alert(res.ok ? 'Settings updated' : 'Failed to update settings');
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new URLSearchParams(new FormData(form));

      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (res.redirected) {
        window.location.href = res.url;
      } else {
        alert('Login failed');
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new URLSearchParams(new FormData(form));

      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const result = await res.json();

      if (res.ok) {
        alert('Registration successful');
        checkSession();
        fetchBooks();
      } else {
        alert('Registration failed: ' + result.error)
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/auth/logout');
      checkSession();
      fetchBooks();
    });
  }
});

async function fetchBooks() {
  const bookList = document.getElementById('book-list');
  if (!bookList) return;

  const res = await fetch('/api/books');
  const books = await res.json();

  bookList.innerHTML = books.map(book => {
    const isOwner = currentUsername && book.owner?.username === currentUsername;
    const isRequester = currentUsername && book.requestedBy?.username === currentUsername;

    let buttons = '';

    if (!isOwner && book.status === "available") {
      buttons = `<button onclick="requestTrade('${book._id}')">Request Trade</button>`;
    }

    if (isOwner && book.status === "pending") {
      buttons = `<button onclick="acceptTrade('${book._id}')">Accept Trade</button>
      <button onclick="cancelTrade('${book._id}')">Cancel</button>`;

    if (isRequester && book.status === "pending") {
      buttons = `<button onclick="cancelTrade('${book._id}')">Cancel</button>`;
    }

    const statusMsg = book.status === "pending" && book.requestedBy
      ? `<em>Trade requested by ${book.requestedBy?.username}</em>`
      : '';
      
      return `<li>
            <strong>${book.title}</strong> (owner: ${book.owner?.username|| 'Unknown'}),br>
            ${statusMsg}<br>
            ${buttons}
          </li>`;
  }).join('');
}

async function requestTrade(bookId) {
  const res = await fetch(`/api/books/${bookId}/request`, { method: "POST" });
  const result = await res.json();
  alert(result.message || "Trade requested");
  fetchBooks();
}

async function acceptTrade(bookId) {
  const res = await fetch(`/api/books/${bookId}/accept`, { method: "POST" });
  const result = await res.json();
  alert(result.message || "Trade accepted");
  fetchBooks();
}

let currentUsername = null;

async function checkSession() {
  const res = await fetch('/api/users/me');
  const data = await res.json();

  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');
  const authForms = document.getElementById('auth-forms');

  if (data.loggedIn) {
    userInfo.style.display = 'block';
    authForms.style.display = 'none';
    userName.textContent = data.user.fullName || data.user.username;
    currentUsername = data.user.username;
  } else {
    userInfo.style.display = 'none';
    authForms.style.display = 'block';
    currentUsername = null;
  }
}
