import React, { useEffect, useState } from "react";

// Online Bookstore - Frontend-only (no backend)
// Single-file React component (default export) suitable for a Vite + React app.
// Uses Tailwind CSS classes for styling. Data is stored in localStorage as JSON
// so the app is dynamic (create, read, update, delete) but entirely client-side.

// ---------- Initial sample data (used only on first load) ----------
const SAMPLE_BOOKS = [
  {
    id: 'b1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: 29.99,
    available: true,
    description: 'A handbook of agile software craftsmanship.'
  },
  {
    id: 'b2',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    price: 24.5,
    available: true,
    description: 'Tips and practices for pragmatic software development.'
  }
];

const SAMPLE_USERS = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com', password: 'password' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com', password: 'password' }
];

// ---------- Utilities ----------
const LS_KEYS = {
  BOOKS: 'ob_books_v1',
  USERS: 'ob_users_v1',
  CURRENT_USER: 'ob_current_user_v1',
  CART: 'ob_cart_v1'
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse localStorage', e);
    return fallback;
  }
}

function saveToStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

// ---------- Main App ----------
export default function App() {
  // Data states
  const [books, setBooks] = useState(() => loadFromStorage(LS_KEYS.BOOKS, SAMPLE_BOOKS));
  const [users, setUsers] = useState(() => loadFromStorage(LS_KEYS.USERS, SAMPLE_USERS));
  const [currentUser, setCurrentUser] = useState(() => loadFromStorage(LS_KEYS.CURRENT_USER, null));
  const [cart, setCart] = useState(() => loadFromStorage(LS_KEYS.CART, {}));

  // UI states
  const [view, setView] = useState('catalog'); // catalog | book-edit | book-add | profile | login | signup | cart
  const [editingBook, setEditingBook] = useState(null);
  const [query, setQuery] = useState('');

  // Sync to localStorage when data changes
  useEffect(() => saveToStorage(LS_KEYS.BOOKS, books), [books]);
  useEffect(() => saveToStorage(LS_KEYS.USERS, users), [users]);
  useEffect(() => saveToStorage(LS_KEYS.CURRENT_USER, currentUser), [currentUser]);
  useEffect(() => saveToStorage(LS_KEYS.CART, cart), [cart]);

  // ---------- Auth handlers (client-side simulated) ----------
  function signup({ name, email, password }) {
    if (users.find((u) => u.email === email)) {
      throw new Error('Email already in use');
    }
    const newUser = { id: uid('u'), name, email, password };
    const next = [...users, newUser];
    setUsers(next);
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    setView('catalog');
  }

  function login({ email, password }) {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid credentials');
    setCurrentUser({ id: found.id, name: found.name, email: found.email });
    setView('catalog');
  }

  function logout() {
    setCurrentUser(null);
    setView('catalog');
  }

  // ---------- Book CRUD (client-side) ----------
  function addBook({ title, author, price, description, available }) {
    const newBook = { id: uid('b'), title, author, price: Number(price), description, available: !!available };
    setBooks((s) => [newBook, ...s]);
    setView('catalog');
  }

  function updateBook(id, patch) {
    setBooks((s) => s.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setEditingBook(null);
    setView('catalog');
  }

  function deleteBook(id) {
    setBooks((s) => s.filter((b) => b.id !== id));
  }

  // ---------- Cart ----------
  function addToCart(bookId, qty = 1) {
    setCart((c) => {
      const next = { ...c };
      next[bookId] = (next[bookId] || 0) + qty;
      return next;
    });
  }

  function removeFromCart(bookId) {
    setCart((c) => {
      const next = { ...c };
      delete next[bookId];
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  function checkout() {
    if (!currentUser) {
      alert('Please login or signup before checking out.');
      setView('login');
      return;
    }
    // client-side only: we simply clear cart and show success message
    clearCart();
    alert('Checkout successful (client-only demo). Thank you, ' + currentUser.name + '!');
    setView('catalog');
  }

  // ---------- Filtering & derived data ----------
  const filteredBooks = books.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (b.title + ' ' + b.author + ' ' + (b.description || '')).toLowerCase().includes(q);
  });

  const cartItems = Object.entries(cart).map(([bookId, qty]) => {
    const book = books.find((b) => b.id === bookId);
    return { book, qty };
  }).filter(x => x.book);

  const cartTotal = cartItems.reduce((s, it) => s + (it.book.price * it.qty), 0);

  // ---------- Small UI components ----------
  function Header() {
    return (
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Online Bookstore — Client-only</h1>
          <div className="text-sm text-gray-500">(JSON in localStorage, no backend)</div>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, description..."
            className="border rounded px-3 py-1 text-sm"
          />
          <button className="px-3 py-1 rounded border" onClick={() => { setView('catalog'); setQuery(''); }}>
            Reset
          </button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => setView('cart')}>
            Cart ({cartItems.length}) — ${cartTotal.toFixed(2)}
          </button>
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="text-sm">Hi, <strong>{currentUser.name}</strong></div>
              <button className="px-2 py-1 border rounded" onClick={() => setView('profile')}>Profile</button>
              <button className="px-2 py-1 border rounded" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => setView('login')}>Login</button>
              <button className="px-2 py-1 border rounded" onClick={() => setView('signup')}>Signup</button>
            </div>
          )}
        </div>
      </header>
    );
  }

  function CatalogView() {
    return (
      <main className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Catalog</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded" onClick={() => { setEditingBook(null); setView('book-add'); }}>
              + Add Book
            </button>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-gray-500">No books found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((b) => (
              <div key={b.id} className="border rounded p-4 bg-white shadow-sm flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{b.title}</h3>
                    <div className="text-sm text-gray-600">by {b.author}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${b.price.toFixed(2)}</div>
                    <div className={`text-sm ${b.available ? 'text-green-600' : 'text-red-600'}`}>
                      {b.available ? 'In stock' : 'Unavailable'}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700 flex-1">{b.description}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => { addToCart(b.id, 1); }}>
                      Add to cart
                    </button>
                    <button className="px-2 py-1 border rounded" onClick={() => { setEditingBook(b); setView('book-edit'); }}>
                      Edit
                    </button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => { if (confirm('Delete this book?')) deleteBook(b.id); }}>
                      Delete
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">ID: {b.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  function BookForm({ initial = {}, onSave, onCancel }) {
    const [title, setTitle] = useState(initial.title || '');
    const [author, setAuthor] = useState(initial.author || '');
    const [price, setPrice] = useState(initial.price || '0');
    const [description, setDescription] = useState(initial.description || '');
    const [available, setAvailable] = useState(initial.available ?? true);

    return (
      <div className="p-6 max-w-xl">
        <h3 className="text-lg font-semibold mb-3">{initial.id ? 'Edit Book' : 'Add Book'}</h3>
        <div className="grid gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border p-2 rounded" />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="border p-2 rounded" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" step="0.01" className="border p-2 rounded" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Available</label>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => onSave({ title, author, price, description, available })}>Save</button>
            <button className="px-3 py-1 border rounded" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  function ProfileView() {
    return (
      <main className="p-6">
        <h2 className="text-xl font-medium mb-4">Profile</h2>
        {currentUser ? (
          <div className="max-w-lg">
            <div className="mb-2">Name: <strong>{currentUser.name}</strong></div>
            <div className="mb-2">Email: <strong>{currentUser.email}</strong></div>
            <div className="text-sm text-gray-600">This is a client-side demo; profile data is stored in localStorage.</div>
          </div>
        ) : (
          <div>Please login to view your profile.</div>
        )}
      </main>
    );
  }

  function LoginView() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    async function handleLogin(e) {
      e.preventDefault();
      try {
        login({ email, password });
      } catch (err) {
        setError(err.message);
      }
    }

    return (
      <main className="p-6">
        <h2 className="text-xl font-medium mb-4">Login</h2>
        <form onSubmit={handleLogin} className="max-w-sm grid gap-2">
          {error && <div className="text-red-600">{error}</div>}
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded" placeholder="Password" type="password" />
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" type="submit">Login</button>
            <button className="px-3 py-1 border rounded" type="button" onClick={() => setView('signup')}>Go to Signup</button>
          </div>
        </form>
      </main>
    );
  }

  function SignupView() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    async function handleSignup(e) {
      e.preventDefault();
      try {
        signup({ name, email, password });
      } catch (err) {
        setError(err.message);
      }
    }

    return (
      <main className="p-6">
        <h2 className="text-xl font-medium mb-4">Signup</h2>
        <form onSubmit={handleSignup} className="max-w-sm grid gap-2">
          {error && <div className="text-red-600">{error}</div>}
          <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded" placeholder="Your name" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded" placeholder="Password" type="password" />
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" type="submit">Signup</button>
            <button className="px-3 py-1 border rounded" type="button" onClick={() => setView('login')}>Go to Login</button>
          </div>
        </form>
      </main>
    );
  }

  function CartView() {
    return (
      <main className="p-6">
        <h2 className="text-xl font-medium mb-4">Your Cart</h2>
        {cartItems.length === 0 ? (
          <div className="text-gray-500">Your cart is empty.</div>
        ) : (
          <div className="max-w-2xl space-y-3">
            {cartItems.map(({ book, qty }) => (
              <div key={book.id} className="flex items-center justify-between border rounded p-3 bg-white">
                <div>
                  <div className="font-semibold">{book.title}</div>
                  <div className="text-sm text-gray-600">by {book.author}</div>
                </div>
                <div className="text-right">
                  <div>{qty} x ${book.price.toFixed(2)}</div>
                  <div className="font-bold">${(book.price * qty).toFixed(2)}</div>
                  <div className="mt-2 flex gap-2 justify-end">
                    <button className="px-2 py-1 border rounded" onClick={() => removeFromCart(book.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-right font-semibold">Total: ${cartTotal.toFixed(2)}</div>
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 border rounded" onClick={() => { clearCart(); }}>Clear</button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => checkout()}>Checkout</button>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ---------- Router-like simple view switch ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto">
        {view === 'catalog' && <CatalogView />}
        {view === 'book-add' && (
          <div className="p-6">
            <BookForm onSave={(data) => addBook(data)} onCancel={() => setView('catalog')} />
          </div>
        )}
        {view === 'book-edit' && editingBook && (
          <div className="p-6">
            <BookForm initial={editingBook} onSave={(data) => updateBook(editingBook.id, data)} onCancel={() => setView('catalog')} />
          </div>
        )}
        {view === 'profile' && <ProfileView />}
        {view === 'login' && <LoginView />}
        {view === 'signup' && <SignupView />}
        {view === 'cart' && <CartView />}
      </div>

      <footer className="mt-8 p-4 text-center text-sm text-gray-600">Client-only demo • Data stored in browser localStorage (JSON) • No backend or SQL</footer>
    </div>
  );
}
