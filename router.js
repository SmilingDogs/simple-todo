// router.js - Simple Vanilla JS Router
class Router {
  constructor(controller) {
    this.controller = controller;
    window.addEventListener("hashchange", () => this.handleRouteChange());
    this.handleRouteChange();
  }

  handleRouteChange() {
    const hash = window.location.hash;
    let taskId = hash.split("/").pop();
    if (taskId.includes("%20")) {
      taskId = decodeURIComponent(taskId);
    }
    if (taskId == "undefined" || taskId == "") {
      this.controller.showTodoList();
    } else {
      this.controller.showTaskDetails(taskId);
    }
  }
}

export default Router;
