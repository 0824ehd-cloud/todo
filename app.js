const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const itemCount = document.getElementById('item-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clear-completed');
const themeToggle = document.getElementById('theme-toggle');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let currentFilter = 'all';

function save() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFiltered() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return todos;
}

function render() {
    const filtered = getFiltered();
    const activeCount = todos.filter(t => !t.completed).length;

    itemCount.textContent = `${activeCount}개 남음`;

    if (filtered.length === 0) {
        const isCompleted = currentFilter === 'completed';
        todoList.innerHTML = `
            <li class="empty-state">
                <span class="icon">${isCompleted ? '✅' : '📝'}</span>
                <p>${isCompleted ? '완료된 항목이 없어요' : '할 일을 추가해보세요!'}</p>
            </li>`;
        return;
    }

    todoList.innerHTML = filtered.map(todo => `
        <li class="todo-item" data-id="${todo.id}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-action="toggle"></div>
            <span class="todo-text ${todo.completed ? 'completed' : ''}" data-action="toggle">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" data-action="delete" aria-label="삭제">✕</button>
        </li>`).join('');
}

function addTodo() {
    const text = input.value.trim();
    if (!text) {
        input.focus();
        return;
    }
    todos.unshift({ id: Date.now(), text, completed: false });
    input.value = '';
    save();
    render();
    input.focus();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        save();
        render();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
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

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

clearBtn.addEventListener('click', () => {
    todos = todos.filter(t => !t.completed);
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

render();
