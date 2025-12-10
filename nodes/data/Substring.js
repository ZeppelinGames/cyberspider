import GraphNode from "../GraphNode.js";
import NumberIO from "../IO/NumberIO.js";
import StringIO from "../IO/StringIO.js";


export default class Substring extends GraphNode {
    constructor(x, y) {
        super("Substring", x, y);
        this.addInput(new StringIO("input", "Input"));
        this.addInput(new NumberIO("start", "Start"));
        this.addInput(new NumberIO("length", "Length"));
        this.addOutput(new StringIO("output", "Output"));
    }

    validate() {
        const input = this.getInputValue("input");
        const start = this.getInputValue("start") || 0;
        const length = this.getInputValue("length") || input?.length || 0;
        if (isNaN(start) || !Number.isInteger(start)) {
            this.setStatus(false, "Start must be within the bounds of the input string");
            this.setOutputValue("output", null);
            return false;
        }
        if (isNaN(length) || !Number.isInteger(length)) {
            this.setStatus(false, "Length must be a non-negative integer and within the bounds of the input string");
            this.setOutputValue("output", null);
            return false;
        }
        return true;
    }

    onCompute() {
        const input = this.getInputValue("input") || "";
        const start = this.getInputValue("start") || 0;
        const length = this.getInputValue("length") || input.length;
        const substr = String(input).slice(start, start + length);
        this.setOutputValue("output", substr);
    }
}