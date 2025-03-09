class Task {
  constructor(text) {
    this.text = text;
    this.completed = false;
    this.priority = false;
  }
}

const model = {
  list: localStorage.getItem("todos")
    ? JSON.parse(localStorage.getItem("todos"))
    : [],
  search: [],
};

export { Task, model };
