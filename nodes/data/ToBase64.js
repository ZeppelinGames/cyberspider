import GraphNode from "../GraphNode.js";
import TextboxIO from "../IO/TextboxIO.js";


export default class ToBase64 extends GraphNode {
    constructor(x, y) {
        super("To Base64", x, y);
        this.addInput(new TextboxIO("input"));
        this.addOutput(new TextboxIO("output"));
    }

    validate() {
        const input = this.getInputValue("input");
        try {
            btoa(input);
        } catch (e) {
            this.setStatus(false, "Invalid string for Base64 encoding");
            this.setOutputValue("output", null);
            return false;
        }
        return true;
    }
    onCompute() {
        const input = this.getInputValue("input");
        const encoded = btoa(input);
        this.setOutputValue("output", encoded);
    }
}