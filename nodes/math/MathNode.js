import GraphNode from "../GraphNode.js";
import DropdownIO from "../IO/DropdownIO.js";
import NumberIO from "../IO/NumberIO.js";

export default class MathNode extends GraphNode {
  constructor(x, y) {
    super("Math", x, y);
    this.addInput(new NumberIO("A"));
    this.addInput(new NumberIO("B"));
    this.addInput(new DropdownIO("Operation", ["Add", "Subtract", "Multiply", "Divide"]));
    this.addOutput(new NumberIO("Result"));

  }

  validate() {
    const a = this.getInputValue("A");
    const b = this.getInputValue("B");
    if (Number.isNaN(Number(a)) || Number.isNaN(Number(b))) {
      this.setStatus(false, "Inputs must be numbers");
      this.setOutputValue("Result", null);
      return false;
    }
    return true;
  }

  onCompute() {
    const a = Number(this.getInputValue("A"));
    const b = Number(this.getInputValue("B"));

    const operation = this.getInputValue("Operation");

    let sum = 0;
    switch (operation) {
      case "Add":
        sum = a + b;
        break;
      case "Subtract":
        sum = a - b;
        break;
      case "Multiply":
        sum = a * b;
        break;
      case "Divide":
        if (b === 0) {
          sum = NaN;
          this.setStatus(false, "Division by zero");
          return;
        }
        sum = b !== 0 ? a / b : NaN;
        break;
    }
    this.setOutputValue("Result", sum);
  }
}
