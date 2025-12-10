import GraphNode from "../GraphNode.js";
import StringIO from "../IO/StringIO.js";


export default class ToLower extends GraphNode {
    constructor(x, y) {
        super("To Lowercase", x, y);
        this.addInput(new StringIO("input"));
        this.addOutput(new StringIO("output"));
    }
    onValidate() {
        return true;
    }
    onCompute() {
        const input = this.getInputValue("input") || "";
        this.setOutputValue("output", String(input).toLowerCase());
    }
}