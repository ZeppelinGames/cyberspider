import GraphNode from "../GraphNode.js";
import TextboxIO from "../IO/TextboxIO.js";


export default class FromBase64 extends GraphNode {
    constructor(x, y) {
        super("From Base64", x, y);
        this.addInput(new TextboxIO("input"));
        this.addOutput(new TextboxIO("output"));
    }

    validate() {
        const input = this.getInputValue("input");
        try {
            atob(input);
        } catch (e) {
            this.setStatus(false, "Invalid string for Base64 decoding");
            this.setOutputValue("output", null);
            return false;
        }
        return true;
    }
    onCompute() {
        const input = this.getInputValue("input");
        const decoded = atob(input);
        this.setOutputValue("output", decoded);
    }
}