import GraphNode from "../GraphNode.js";
import NumberIO from "../IO/NumberIO.js";

export default class ConstantNumber extends GraphNode {
  constructor(x, y) {
    super("Const Number", x, y);
    this.addOutput(new NumberIO("output"));
  }

  validate() {
    const output = this.getOutputValue("output");
    if (Number.isNaN(Number.parseFloat(output))) {
      this.setStatus(false, "Output must be a number");
      return false;
    }
    return true;
  }

  onCompute() {}
}
