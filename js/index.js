let allTodos = [];

function htmlTemplate(marked, title, description, timeStamp) {
  if (marked) {
    return `
      <section class="card card--item card__lskyblue">
        <div class="text"><strike>
        <h5>${timeStamp}</h5>
          <h2>${title}</h2>
          <p>${description}</p><br>
        </div></strike>
        <button class="mark">Mark un-done </button>
        <button class="remove">Remove </button>
      </section>`;
  }
  return `
    <section class="card card--item card__lskyblue">
      <div class="text">
        <h5>${timeStamp}</h5>
        <h2>${title}</h2>
        <p>${description}</p><br>
      </div>
      <button class="mark">Mark done </button> 
    </section>`;
}

function setLocalStorage() {
  localStorage.removeItem('todos');
  localStorage.setItem('todos', JSON.stringify(allTodos));
}

class Todo {
  constructor(title, description, timeStamp = null, marked = false, removed = false, order = null) {
    this.value = {
      title,
      description,
      nodeElement: null,
      timeStamp,
    };
    this.state = {
      marked,
      removed,
      order,
    };
    this.method = {
      createNode: this.createNode.bind(this),
      listenForMark: this.listenForMark.bind(this),
      setTimestamp: this.setTimestamp.bind(this),
      printToDom: this.printToDom.bind(this),
      remove: this.remove.bind(this),
    };
    this.getHtml.bind(this);
  }

  setTimestamp() {
    if (!this.value.timeStamp) {
      const date = new Date();
      this.value.timeStamp = `${date.toDateString()} - ${date.getHours()}:${date.getMinutes()}`;
      this.state.order = date.getTime().toString().slice(6);
    }
  }

  getHtml() {
    return htmlTemplate(this.state.marked, this.value.title,
      this.value.description, this.value.timeStamp);
  }

  createNode() {
    const html = this.getHtml();
    const card = document.createElement('div');
    card.innerHTML = html;
    card.style.order = this.state.order;
    this.value.nodeElement = card;
    setLocalStorage();
  }

  printToDom() {
    return this.state.marked ? document.querySelector('.todos--done').appendChild(this.value.nodeElement)
      : document.querySelector('.todos').appendChild(this.value.nodeElement);
  }

  listenForMark() {
    const markBtn = this.value.nodeElement.querySelector('.mark');
    this.method.remove();
    markBtn.addEventListener('click', (e) => {
      this.state.marked = !this.state.marked;
      e.target.parentElement.remove();
      this.createNode();
      this.printToDom();
      this.listenForMark();
    });
  }

  remove() {
    if (this.state.marked) {
      const removeBtn = this.value.nodeElement.querySelector('.remove');
      removeBtn.addEventListener('click', (e) => {
        this.state.removed = true;
        e.target.parentElement.remove();
        setLocalStorage();
      });
    }
  }
}

document.querySelector('.btn--add').addEventListener('click', (e) => {
  e.preventDefault();
  const title = document.querySelector('.title').value;
  const description = document.querySelector('.description').value;
  const card = new Todo(title, description);
  card.method.setTimestamp();
  card.method.createNode();
  card.method.printToDom();
  card.method.listenForMark();
  allTodos.push(card);
  allTodos = allTodos.filter(t => !t.state.removed);
  e.target.parentElement.reset();
  setLocalStorage();
});

document.querySelector('.btn--order').addEventListener('click', (e) => {
  const todos = document.querySelector('.todos');
  const todosDone = document.querySelector('.todos--done');
  if (e.target.dataset.order === 'newest') {
    e.target.dataset.order = 'oldest';
    todos.style.flexFlow = 'column-reverse';
    todosDone.style.flexFlow = 'column-reverse';
  } else {
    e.target.dataset.order = 'newest';
    todos.style.flexFlow = 'column';
    todosDone.style.flexFlow = 'column';
  }
});

function displayTodos() {
  allTodos.forEach((card) => {
    card.method.createNode();
    card.method.printToDom();
    card.method.listenForMark();
  });
}

window.onload = () => {
  const storedTodo = localStorage.getItem('todos');
  if (storedTodo) {
    allTodos = JSON.parse(storedTodo).map(card => new Todo(card.value.title,
      card.value.description, card.value.timeStamp,
      card.state.marked, card.state.removed, card.state.order));
    allTodos = allTodos.filter(t => !t.state.removed);
  }
  displayTodos();
};
