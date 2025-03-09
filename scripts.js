//prettier-ignore
let day = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
//prettier-ignore
let month = new Date().toString().split(" ")[1];
console.log(month);
let year = new Date().getFullYear().toString();

const title = document.querySelector("h1");
title.textContent = `for ${day} ${month} ${year}`;

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

const view = {
  clearList() {
    document.getElementById("list").innerHTML = "";
  },

  createIcon(name) {
    const icon = document.createElement("ion-icon");
    icon.setAttribute("name", name);
    return icon;
  },

  createIconTooltip(text) {
    const tooltip = document.createElement("div");
    tooltip.setAttribute("class", "tooltip");
    const tooltipText = document.createElement("span");
    tooltipText.setAttribute("class", "tooltip-text");
    tooltipText.textContent = text;
    tooltip.append(tooltipText);
    return tooltip;
  },

  render(what) {
    this.clearList();

    if (what.length != 0) {
      let list = document.getElementById("list");

      for (let i = 0; i < what.length; i++) {
        const item = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = what[i].text;
        item.setAttribute("class", "item");
        span.setAttribute("class", "item-text");

        const check = this.createIcon("checkmark-outline");
        const trash = this.createIcon("trash-outline");
        const star = this.createIcon("star-outline");
        const edit = this.createIcon("create-outline");

        if (i === 0) {
          const checkTooltip = this.createIconTooltip("Complete");
          const trashTooltip = this.createIconTooltip("Delete");
          const starTooltip = this.createIconTooltip("Priority");
          const editTooltip = this.createIconTooltip("Edit");

          checkTooltip.append(check);
          trashTooltip.append(trash);
          starTooltip.append(star);
          editTooltip.append(edit);
          //prettier-ignore
          item.append(span, checkTooltip, trashTooltip, starTooltip, editTooltip);
        } else {
          item.append(span, check, trash, star, edit);
        }
        list.append(item);

        if (what[i].completed) {
          //prettier-ignore
          span.setAttribute("style", "text-decoration: line-through; color: #bbb");
          check.setAttribute("style", "color: #bbb");
          trash.setAttribute("style", "color: #bbb");
          star.setAttribute("style", "color: #bbb");
          edit.setAttribute("style", "color: #bbb");
        }
        //* Make a first task's star full;
        what[i].priority ? (star.name = "star") : (star.name = "star-outline");

        //* Add our onclick functions for complete/delete actions

        check.addEventListener("click", () => controller.completeItem(what[i]));
        trash.addEventListener("click", () => controller.deleteItem(what[i]));
        //prettier-ignore
        star.addEventListener("click", () => controller.prioritizeItem(what[i]));
        edit.addEventListener("click", (e) => controller.editItem(what[i], e));
        const add = document.querySelector(".add-icon");
        const search = document.querySelector(".search-icon");

        add.addEventListener("click", () => {
          document.getElementById("add-item").focus();
        });
        search.addEventListener("click", () => {
          document.getElementById("search-item").focus();
        });
      }
    } else {
      this.renderEmpty("No tasks...");
    }
  },

  renderEmpty(text) {
    this.clearList();

    const item = document.createElement("li");
    const span = document.createElement("span");
    item.className = "item";
    span.className = "item-text";
    span.textContent = text;
    item.appendChild(span);
    list.appendChild(item);
  },
};

const controller = {
  init() {
    view.render(model.list);
  },

  addTask(e) {
    if (e.code == "Enter" || e.code == "NumpadEnter") {
      let inputValue = document.getElementById("add-item").value;
      //prettier-ignore
      if (model.list.some((i) => i.text.toLowerCase() === inputValue.toLowerCase())) {
        document.getElementById("popup").classList.add("active");
        setTimeout(() => {
          document.getElementById("popup").classList.remove("active");
        }, 2000);
        return false;
      }
      if (inputValue != "" && inputValue.trim() != "") {
        controller.addItem(new Task(inputValue));
        return false;
      }
    }
  },

  searchTask(e) {
    if (e.code == "Enter" || e.code == "NumpadEnter") {
      let inputValue = document.getElementById("search-item").value;
      if (inputValue != "" && inputValue != " ") {
        controller.searchItem(inputValue);
        return false;
      }
    }
  },

  sortItems() {
    return model.list.sort((a, b) => Number(a.completed) - Number(b.completed));
  },

  addItem(task) {
    model.list.push(task);
    console.log(task);
    controller.sortItems();
    document.getElementById("add-item").value = "";

    view.render(model.list);
    controller.save();
  },

  completeItem(listItem) {
    listItem.completed = !listItem.completed;
    listItem.priority = false;
    controller.sortItems();

    view.render(model.list);
    controller.save();
  },

  deleteItem(listItem) {
    model.list = model.list.filter(
      (remainItem) => remainItem.text !== listItem.text
    );
    view.render(model.list);
    controller.save();
  },

  prioritizeItem(listItem) {
    listItem.priority = !listItem.priority;
    model.list.sort((a, b) => Number(b.priority) - Number(a.priority));

    view.render(model.list);
    controller.save();
  },

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
        view.render(model.list);
        controller.save();
      }
    });
  },

  searchItem(query) {
    model.search = model.list.filter((task) =>
      task.text.toLowerCase().includes(query.toLowerCase())
    );
    document.getElementById("search-item").value = "";

    if (model.search.length) {
      view.render(model.search);
    } else {
      view.renderEmpty("Nothing found...");
    }
  },

  save() {
    localStorage.setItem("todos", JSON.stringify(model.list));
  },
};

controller.init();

const taskInput = document.getElementById("add-item");
const searchInput = document.getElementById("search-item");

taskInput.addEventListener("keydown", controller.addTask);
taskInput.addEventListener("focus", () => {
  if (model.list.length) {
    controller.init();
  }
});
searchInput.addEventListener("keydown", controller.searchTask);
