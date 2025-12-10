import GraphNode from "../GraphNode.js";
import StringIO from "../IO/StringIO.js";


export default class ToUpper extends GraphNode {
    constructor(x, y) {
        super("To Uppercase", x, y);
        this.addInput(new StringIO("input"));
        this.addOutput(new StringIO("output"));
    }
    onCompute() {
        const input = this.getInputValue("input") || "";
        this.setOutputValue("output", String(input).toUpperCase());
    }
}