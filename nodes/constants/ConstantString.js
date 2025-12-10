import GraphNode from "../GraphNode.js";
import StringIO from "../IO/StringIO.js";

export default class ConstantString extends GraphNode {
  constructor(x, y) {
    super("Const String", x, y);
    this.addOutput(new StringIO("output"));
  }
}
