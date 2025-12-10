import GraphNode from "../GraphNode.js";
import TextboxIO from "../IO/TextboxIO.js";

export default class ConstantTextbox extends GraphNode {
  constructor(x, y) {
    super("Const Textbox", x, y);
    this.addOutput(new TextboxIO("output"));
  }
}
