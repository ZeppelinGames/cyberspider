import TinyGraphInstance from "../tinygraph.js";

class GraphNode {
  constructor(id, x = 0, y = 0) {
    console.log("Creating GraphNode:", id);
    this.id = id;
    this.x = x;
    this.y = y;

    this.inputs = new Map();
    this.outputs = new Map();

    this.options = {};
    this.value = null;

    // Status
    this.setStatus(true, "Ok");
    this.statusElement = null;

    // Transformation
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    // DOM setup
    this.rootElement = this._createNodeContainer();
    // In GraphNode.js, after creating rootElement
    this.rootElement.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      if (e.shiftKey) {
        // Toggle selection
        const idx = TinyGraphInstance.selectedNodes.indexOf(this);
        if (idx === -1) {
          TinyGraphInstance.selectedNodes.push(this);
        } else {
          TinyGraphInstance.selectedNodes.splice(idx, 1);
        }
      } else {
        // Single select
        TinyGraphInstance.selectedNodes = [this];
      }
      TinyGraphInstance.highlightSelectedNodes();
    });

    this.ioContainer;
    this.onMount();
  }

  _createNodeContainer() {
    const node = document.createElement("div");
    node.className = "node";

    // Title bar
    const titleBar = document.createElement("div");
    titleBar.className = "node-titlebar";
    titleBar.addEventListener("mousedown", (e) => this._onDragStart(e));

    const titleSpan = document.createElement("span");
    titleSpan.textContent = this.id;

    const statusSpan = document.createElement("span");
    statusSpan.className = "node-status";
    this.statusElement = statusSpan;
    this.updateStatus();

    titleBar.appendChild(titleSpan);
    titleBar.appendChild(statusSpan);

    // IO list
    this.ioContainer = document.createElement("div");
    this.ioContainer.className = "node-io-list";

    // Assemble node
    node.appendChild(titleBar);
    node.appendChild(this.ioContainer);
    return node;
  }

  _onDragStart(e) {
    e.preventDefault();
    if (e.button !== 0) return; // Only left mouse button

    this.isDragging = true;
    this.dragOffset.x = e.clientX - this.x;
    this.dragOffset.y = e.clientY - this.y;

    // Bind events to document to allow dragging outside the node
    const onMouseMove = (ev) => this._onDrag(ev);
    const onMouseUp = () => {
      this.isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  _onDrag(e) {
    if (!this.isDragging) return;
    this.x = e.clientX - this.dragOffset.x;
    this.y = e.clientY - this.dragOffset.y;
    this.updateTransform();
  }

  // Create node element
  onMount() {
    this.updateTransform();
    document.body.appendChild(this.rootElement);
    return this.rootElement;
  }

  updateTransform() {
    this.rootElement.style.left = `${this.x}px`;
    this.rootElement.style.top = `${this.y}px`;

    TinyGraphInstance.drawConnections();
  }

  setStatus(status, message) {
    this.status = status;
    this.statusMessage = message || "Invalid IO";
    this.updateStatus();
  }

  updateStatus() {
    if (this.statusElement) {
      this.statusElement.title = this.statusMessage;
      this.statusElement.style.backgroundColor = this.status ? "#5e5" : "#e55";
    }
  }

  addInput(io) {
    if (this.inputs.has(io.id)) {
      console.warn(`Input with id ${io.id} already exists on node ${this.id}`);
      return;
    }
    this.inputs.set(io.id, io);
    this.registerIO(io, true);
  }

  addOutput(io) {
    if (this.outputs.has(io.id)) {
      console.warn(`Output with id ${io.id} already exists on node ${this.id}`);
      return;
    }
    this.outputs.set(io.id, io);
    this.registerIO(io, false);
  }

  registerIO(io, isInput = true) {
    io.setNode(this);
    io.isInput = isInput;
    const ioDOM = io.mount(isInput);
    this.ioContainer.appendChild(ioDOM);
  }

  getInputValue(id) {
    const io = this.inputs.get(id);
    return io ? io.getValue() : null;
  }
  getOutputValue(id) {
    const io = this.outputs.get(id);
    return io ? io.getValue() : null;
  }

  setOutputValue(id, value) {
    const io = this.outputs.get(id);
    if (io) {
      io.setValue(value);

      // Propagate value to connected inputs
      for (const inputIO of io.connections) {
        inputIO.value = value;
        if (inputIO.node && typeof inputIO.node.update === "function") {
          inputIO.node.compute();
        }
      }
    }
  }

  // Override in subclasses for custom validation
  validate() { return true; }

  compute() {
    // No cycle detection here; handled by graph engine
    console.log(`Computing node ${this.id}`);
    this.setStatus(true, "Ok");

    if (!this.validate()) {
      this.setStatus(false, this.statusMessage || "Validation failed");
      return false;
    }

    this.onCompute();
    return true;
  }

  // Override and set outputs accordingly
  onCompute() {}
}

export default GraphNode;
