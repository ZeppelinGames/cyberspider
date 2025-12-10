import GraphNode from "../GraphNode.js";
import StringIO from "../IO/StringIO.js";

export default class Concat extends GraphNode {
    constructor(x, y) {
        super("Concat", x, y);
        this.addInput(new StringIO("input1", "string"));
        this.addInput(new StringIO("input2", "string"));
        this.addOutput(new StringIO("output", "string"));
    }

    onCompute() {
        const input1 = this.getInputValue("input1") || "";
        const input2 = this.getInputValue("input2") || "";
        this.setOutputValue("output", String(input1) + String(input2));
    }
}