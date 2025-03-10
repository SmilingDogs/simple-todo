import { Task, model } from "./model.js";
import View from "./view.js";
//prettier-ignore
let day = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
let month = new Date().toString().split(" ")[1];
let year = new Date().getFullYear().toString();

const title = document.querySelector("h1");
title.textContent = `for ${day} ${month} ${year}`;

class Controller {
  constructor(view) {
    this.view = view;
  }

  init() {
    this.view.render(model.list);
  }

  addTask(e) {
    if (e.code == "Enter" || e.code == "NumpadEnter") {
      let inputValue = document.getElementById("add-item").value;
      //prettier-ignore
      if (model.list.some((i) => i.text.toLowerCase() === inputValue.toLowerCase())) {
          document.getElementById("popup").classList.add("active");
          setTimeout(() => {
            document.getElementById("popup").classList.remove("active");
          }, 2000);
          e.preventDefault();
            return;
        }
      if (inputValue != "" && inputValue.trim() != "") {
        this.addItem(new Task(inputValue));
        e.preventDefault();
        return;
      }
    }
  }

  searchTask(e) {
    if (e.code == "Enter" || e.code == "NumpadEnter") {
      let inputValue = document.getElementById("search-item").value;
      if (inputValue != "" && inputValue != " ") {
        this.searchItem(inputValue);
        e.preventDefault();
        return;
      }
    }
  }

  sortItems() {
    return model.list.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  addItem(task) {
    model.list.push(task);
    this.sortItems();
    document.getElementById("add-item").value = "";
    this.updateView();
  }

  completeItem(listItem) {
    listItem.completed = !listItem.completed;
    listItem.priority = false;
    this.sortItems();
    this.updateView();
  }

  deleteItem(listItem) {
    model.list = model.list.filter(
      (remainItem) => remainItem.text !== listItem.text
    );
    this.updateView();
  }

  prioritizeItem(listItem) {
    listItem.priority = !listItem.priority;
    model.list.sort((a, b) => Number(b.priority) - Number(a.priority));
    this.updateView();
  }

  editItem(listItem, e) {
    const listItemElement = e.target
      .closest(".item")
      .querySelector(".item-text");

    const input = document.createElement("input");
    input.type = "text";
    input.value = listItem.text;
    input.className = "edit-input";
    input.name = "edit-input";
    listItemElement.innerHTML = "";
    listItemElement.appendChild(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.code === "Enter" || e.code === "NumpadEnter") {
        if (input.value.trim() !== "") {
          listItem.text = input.value.trim();
        }
        this.updateView();
      }
    });
  }

  searchItem(query) {
    model.search = model.list.filter((task) =>
      task.text.toLowerCase().includes(query.toLowerCase())
    );
    document.getElementById("search-item").value = "";

    if (model.search.length) {
      this.view.render(model.search);
    } else {
      this.view.renderEmpty("Nothing found...");
    }
  }

  save() {
    localStorage.setItem("todos", JSON.stringify(model.list));
  }

  updateView() {
    this.view.render(model.list);
    this.save();
  }
}
const view = new View();
const controller = new Controller(view);
controller.init();

const taskInput = document.getElementById("add-item");
const searchInput = document.getElementById("search-item");

taskInput.addEventListener("keydown", (e) => controller.addTask(e));
taskInput.addEventListener("focus", () => {
  if (model.list.length) {
    controller.init();
  }
});
searchInput.addEventListener("keydown", (e) => controller.searchTask(e));

export default controller;
