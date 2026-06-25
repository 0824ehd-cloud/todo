const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const itemCount = document.getElementById('item-count');
const clearBtn = document.getElementById('clear-completed');
const themeToggle = document.getElementById('theme-toggle');
const dateDisplay = document.getElementById('date-display');
const dayTabs = document.querySelectorAll('.day-tab');

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_JS_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const todayKey = DAY_JS_MAP[new Date().getDay()];

let todos = JSON.parse(localStorage.getItem('todos-weekly') || '{}');
DAYS.forEach(d => { if (!todos[d]) todos[d] = []; });

let currentDay = todayKey;

function formatDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return `${y}년 ${m}월 ${d}일 ${dayNames[now.getDay()]}`;
}

dateDisplay.textContent = formatDate();

function updateTabs() {
    dayTabs.forEach(tab => {
        const day = tab.dataset.day;
        tab.classList.toggle('active', day === currentDay);
        tab.classList.toggle('today', day === todayKey);
    });
}

function save() {
    localStorage.setItem('todos-weekly', JSON.stringify(todos));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function render() {
    const list = todos[currentDay] || [];
    const activeCount = list.filter(t => !t.completed).length;
    itemCount.textContent = `${activeCount}개 남음`;

    if (list.length === 0) {
        todoList.innerHTML = `
            <li class="empty-state">
                <span class="icon">📝</span>
                <p>할 일을 추가해보세요!</p>
            </li>`;
        return;
    }

    todoList.innerHTML = list.map(todo => `
        <li class="todo-item" data-id="${todo.id}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-action="toggle"></div>
            <span class="todo-text ${todo.completed ? 'completed' : ''}" data-action="toggle">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" data-action="delete" aria-label="삭제">✕</button>
        </li>`).join('');
}

function addTodo() {
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    todos[currentDay].unshift({ id: Date.now(), text, completed: false });
    input.value = '';
    save();
    render();
    input.focus();
}

function toggleTodo(id) {
    const todo = todos[currentDay].find(t => t.id === id);
    if (todo) { todo.completed = !todo.completed; save(); render(); }
}

function deleteTodo(id) {
    todos[currentDay] = todos[currentDay].filter(t => t.id !== id);
    save();
    render();
}

todoList.addEventListener('click', e => {
    const item = e.target.closest('.todo-item');
    if (!item) return;
    const id = Number(item.dataset.id);
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'toggle') toggleTodo(id);
    if (action === 'delete') deleteTodo(id);
});

addBtn.addEventListener('click', addTodo);

input.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTodo();
});

dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        currentDay = tab.dataset.day;
        updateTabs();
        render();
        input.focus();
    });
});

clearBtn.addEventListener('click', () => {
    todos[currentDay] = todos[currentDay].filter(t => !t.completed);
    save();
    render();
});

const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

updateTabs();
render();
