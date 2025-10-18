let tasks = [];
let notes = [];
let stickyNoteCount = 0;
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  setTodayDate();
});

// 🧩 Setup Event Listeners
function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
      document.getElementById(item.dataset.section).classList.add('active');
    });
  });

  document.getElementById('addTaskBtn').addEventListener('click', openTaskModal);
  document.getElementById('addNoteBtn').addEventListener('click', openNoteModal);
  document.getElementById('inviteBtn').addEventListener('click', openInviteModal);
  document.getElementById('inviteBtn2').addEventListener('click', openInviteModal);
  document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
  document.getElementById('stickyBtn').addEventListener('click', createStickyNote);
  document.getElementById('floatingStickyBtn').addEventListener('click', createStickyNote);
}

// 🗓️ Today's date
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(input => input.value = today);
}

// ✅ Task Management
function openTaskModal() {
  const modalHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal(this)">×</span>
      <h2>Add New Task</h2>
      <div class="form-group">
        <label>Task Title</label>
        <input type="text" id="taskTitle">
      </div>
      <div class="form-group">
        <label>Due Date</label>
        <input type="date" id="taskDue">
      </div>
      <button class="btn btn-primary" onclick="saveTask()">Save Task</button>
    </div>`;
  showModal(modalHTML);
}

function saveTask() {
  const title = document.getElementById('taskTitle').value;
  const due = document.getElementById('taskDue').value;
  if (!title) return alert('Please enter a task title');

  const task = { title, due, done: false };
  tasks.push(task);
  renderTasks();
  closeModal();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty-state"><h3>📋 No tasks yet!</h3></div>`;
    return;
  }
  list.innerHTML = tasks.map((t, i) => `
    <div class="task-item ${t.done ? 'done' : ''}">
      <div>
        <input type="checkbox" onchange="toggleTask(${i})" ${t.done ? 'checked' : ''}> 
        <strong>${t.title}</strong> — <small>${t.due}</small>
      </div>
      <div class="task-actions">
        <button onclick="deleteTask(${i})">🗑️</button>
      </div>
    </div>`).join('');
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  renderTasks();
}

function deleteTask(i) {
  tasks.splice(i, 1);
  renderTasks();
}

// 📝 Notes
function openNoteModal() {
  const modalHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal(this)">×</span>
      <h2>Add New Note</h2>
      <div class="form-group">
        <label>Note Title</label>
        <input type="text" id="noteTitle">
      </div>
      <div class="form-group">
        <label>Note Content</label>
        <textarea id="noteContent"></textarea>
      </div>
      <button class="btn btn-primary" onclick="saveNote()">Save Note</button>
    </div>`;
  showModal(modalHTML);
}

function saveNote() {
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteContent').value;
  if (!title && !content) return alert('Please write something');

  const note = { title, content };
  notes.push(note);
  renderNotes();
  closeModal();
}

function renderNotes() {
  const list = document.getElementById('notesList');
  if (notes.length === 0) {
    list.innerHTML = `<div class="empty-state"><h3>📝 No notes yet!</h3></div>`;
    return;
  }
  list.innerHTML = notes.map((n, i) => `
    <div class="note-card">
      <strong>${n.title}</strong>
      <p>${n.content}</p>
      <span class="delete-note" onclick="deleteNote(${i})">🗑️</span>
    </div>`).join('');
}

function deleteNote(i) {
  notes.splice(i, 1);
  renderNotes();
}

// 👥 Collaboration Modal
function openInviteModal() {
  const modalHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal(this)">×</span>
      <h2>Invite Friends</h2>
      <div class="form-group">
        <label>Email Address</label>
        <input type="text" id="inviteEmail" placeholder="friend@example.com">
      </div>
      <button class="btn btn-primary" onclick="sendInvite()">Send Invite</button>
    </div>`;
  showModal(modalHTML);
}

function sendInvite() {
  const email = document.getElementById('inviteEmail').value;
  if (!email) return alert('Enter an email address');
  alert(`Invite sent to ${email}`);
  closeModal();
}

// ⚙️ Settings Modal
function openSettingsModal() {
  const modalHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal(this)">×</span>
      <h2>Settings</h2>
      <div class="form-group">
        <label>Theme</label>
        <select id="themeSelect" onchange="changeTheme(this.value)">
          <option value="pink">Pink</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
        </select>
      </div>
    </div>`;
  showModal(modalHTML);
}

function changeTheme(theme) {
  document.body.className = `theme-${theme}`;
}

// 📌 Sticky Notes
function createStickyNote() {
  stickyNoteCount++;
  const note = document.createElement('div');
  note.classList.add('sticky-note');
  note.style.left = `${100 + stickyNoteCount * 20}px`;
  note.style.top = `${100 + stickyNoteCount * 20}px`;
  note.innerHTML = `
    <button onclick="this.parentElement.remove()">✖</button>
    <textarea placeholder="Type note..."></textarea>
  `;
  note.addEventListener('mousedown', startDrag);
  document.body.appendChild(note);
}

function startDrag(e) {
  draggedElement = e.currentTarget;
  offsetX = e.offsetX;
  offsetY = e.offsetY;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
  if (!draggedElement) return;
  draggedElement.style.left = e.pageX - offsetX + 'px';
  draggedElement.style.top = e.pageY - offsetY + 'px';
}

function stopDrag() {
  draggedElement = null;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
}

// 📦 Modals Generic
function showModal(html) {
  let modal = document.createElement('div');
  modal.classList.add('modal');
  modal.style.display = 'flex';
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

function closeModal(el) {
  if (el) el.closest('.modal').remove();
  else document.querySelectorAll('.modal').forEach(m => m.remove());
}
