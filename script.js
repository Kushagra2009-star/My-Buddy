// Global Variables
let tasks = [];
let notes = [];
let stickyNoteCount = 0;
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setTodayDate();
});

// Setup All Event Listeners
function setupEventListeners() {
    // Navigation Items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId, this);
        });
    });

    // Header Buttons
    document.getElementById('inviteBtn').addEventListener('click', () => openModal('inviteModal'));
    document.getElementById('inviteBtn2').addEventListener('click', () => openModal('inviteModal'));
    document.getElementById('settingsBtn').addEventListener('click', () => openModal('settingsModal'));
    document.getElementById('chatgptBtn').addEventListener('click', () => window.open('https://chat.openai.com', '_blank'));
    
    // Feature Buttons
    document.getElementById('addTaskBtn').addEventListener('click', () => openModal('taskModal'));
    document.getElementById('addNoteBtn').addEventListener('click', () => openModal('noteModal'));
    document.getElementById('stickyBtn').addEventListener('click', () => createStickyNote());
    document.getElementById('floatingStickyBtn').addEventListener('click', () => createStickyNote());

    // Task Modal
    document.getElementById('saveTaskBtn').addEventListener('click', addTask);
    document.getElementById('closeTaskBtn').addEventListener('click', () => closeModal('taskModal'));
    
    // Note Modal
    document.getElementById('saveNoteBtn').addEventListener('click', addNote);
    document.getElementById('closeNoteBtn').addEventListener('click', () => closeModal('noteModal'));
    
    // Invite Modal
    document.getElementById('sendInviteBtn').addEventListener('click', inviteFriend);
    document.getElementById('closeInviteBtn').addEventListener('click', () => closeModal('inviteModal'));
    
    // Settings Modal
    document.getElementById('closeSettingsBtn').addEventListener('click', () => closeModal('settingsModal'));

    // Theme Selector
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            changeTheme(theme, this);
        });
    });

    // Image Upload
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

// Set Today's Date in Task Form
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
}

// Show Section
function showSection(sectionId, navElement) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    navElement.classList.add('active');
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Task Functions
function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const date = document.getElementById('taskDate').value;
    const priority = document.getElementById('taskPriority').value;
    
    if (!title || !date) {
        alert('Please fill in the task title and due date!');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: title,
        description: description,
        date: date,
        priority: priority,
        completed: false
    };
    
    tasks.push(task);
    renderTasks();
    closeModal('taskModal');
    
    // Clear form
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'medium';
    setTodayDate();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><h3>📋 No tasks yet!</h3><p>Click "Add New Task" to get started</p></div>';
        return;
    }
    
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item' + (task.completed ? ' completed' : '');
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox' + (task.completed ? ' checked' : '');
        checkbox.innerHTML = task.completed ? '✓' : '';
        checkbox.onclick = () => toggleTask(task.id);
        
        const taskInfo = document.createElement('div');
        taskInfo.innerHTML = `
            <h3 class="task-title">${task.title}</h3>
            <p style="margin: 0.5rem 0;">${task.description || 'No description'}</p>
            <small>📅 Due: ${new Date(task.date).toLocaleDateString()} | Priority: <strong>${task.priority.toUpperCase()}</strong></small>
        `;
        
        taskContent.appendChild(checkbox);
        taskContent.appendChild(taskInfo);
        
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        actions.innerHTML = `
            <button class="close-btn btn-small" onclick="deleteTask(${task.id})">🗑️ Delete</button>
        `;
        
        taskDiv.appendChild(taskContent);
        taskDiv.appendChild(actions);
        taskList.appendChild(taskDiv);
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    }
}

// Note Functions
function addNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title || !content) {
        alert('Please fill in both the title and content!');
        return;
    }
    
    notes.push({
        id: Date.now(),
        title: title,
        content: content,
        timestamp: new Date().toISOString()
    });
    
    renderNotes();
    closeModal('noteModal');
    
    // Clear form
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    const imageElements = Array.from(notesList.querySelectorAll('.image-container'));
    
    if (notes.length === 0 && imageElements.length === 0) {
        notesList.innerHTML = '<div class="empty-state"><h3>📝 No notes yet!</h3><p>Click "Add New Note" to create your first note</p></div>';
        return;
    }
    
    const emptyState = notesList.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    
    notesList.innerHTML = '';
    imageElements.forEach(img => notesList.appendChild(img));
    
    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';
        noteDiv.innerHTML = `
            <h3>${note.title}</h3>
            <p style="margin: 0.5rem 0;">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
            <small>📅 ${new Date(note.timestamp).toLocaleString()}</small>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary btn-small" onclick="pinNote(${note.id})">📌 Pin as Sticky</button>
                <button class="close-btn btn-small" onclick="deleteNote(${note.id})">🗑️ Delete</button>
            </div>
        `;
        notesList.appendChild(noteDiv);
    });
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        renderNotes();
    }
}

function pinNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        createStickyNote(note.content, note.title);
    }
}

// Image Upload Function
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const notesList = document.getElementById('notesList');
            const emptyState = notesList.querySelector('.empty-state');
            if (emptyState) emptyState.remove();
            
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';
            imgContainer.style.cssText = 'position: relative; margin: 1rem 0; border-radius: 8px; overflow: hidden; border: 2px solid var(--border);';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = 'width: 100%; border-radius: 8px; display: block;';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Remove';
            deleteBtn.className = 'close-btn';
            deleteBtn.style.cssText = 'position: absolute; top: 10px; right: 10px;';
            deleteBtn.onclick = function() {
                imgContainer.remove();
                const notesList = document.getElementById('notesList');
                if (!notesList.querySelector('.note-item') && !notesList.querySelector('.image-container')) {
                    notesList.innerHTML = '<div class="empty-state"><h3>📝 No notes yet!</h3><p>Click "Add New Note" to create your first note</p></div>';
                }
            };
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(deleteBtn);
            notesList.insertBefore(imgContainer, notesList.firstChild);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    }
}

// Sticky Note Functions
function createStickyNote(content, title) {
    stickyNoteCount++;
    const sticky = document.createElement('div');
    sticky.className = 'sticky-note';
    sticky.id = 'sticky-' + stickyNoteCount;
    sticky.style.top = (100 + (stickyNoteCount * 20)) + 'px';
    sticky.style.left = (100 + (stickyNoteCount * 20)) + 'px';
    
    const header = document.createElement('div');
    header.className = 'sticky-note-header';
    
    const titleSpan = document.createElement('strong');
    titleSpan.textContent = title || 'Sticky Note';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 1.2rem;';
    closeBtn.onclick = function() {
        sticky.remove();
    };
    
    header.appendChild(titleSpan);
    header.appendChild(closeBtn);
    header.onmousedown = function(e) {
        startDrag(e, sticky.id);
    };
    
    const textarea = document.createElement('textarea');
    textarea.className = 'sticky-note-content';
    textarea.placeholder = 'Type your note here...';
    textarea.value = content || '';
    
    sticky.appendChild(header);
    sticky.appendChild(textarea);
    document.body.appendChild(sticky);
}

// Drag and Drop Functions for Sticky Notes
function startDrag(e, id) {
    draggedElement = document.getElementById(id);
    offsetX = e.clientX - draggedElement.offsetLeft;
    offsetY = e.clientY - draggedElement.offsetTop;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (draggedElement) {
        draggedElement.style.left = (e.clientX - offsetX) + 'px';
        draggedElement.style.top = (e.clientY - offsetY) + 'px';
    }
}

function stopDrag() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    draggedElement = null;
}

// Collaboration Functions
function inviteFriend() {
    const email = document.getElementById('friendEmail').value.trim();
    if (!email) {
        alert('Please enter an email address!');
        return;
    }
    
    const name = email.split('@')[0];
    const collabList = document.getElementById('collaboratorsList');
    const badge = document.createElement('div');
    badge.className = 'collaborator-badge';
    badge.textContent = name;
    collabList.appendChild(badge);
    
    alert('✅ Invitation sent to ' + email + '!');
    document.getElementById('friendEmail').value = '';
    closeModal('inviteModal');
}

// Theme Functions
function changeTheme(theme, element) {
    document.body.className = theme;
    
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    element.classList.add('active');
}
