import TinyGraphInstance from "../../tinygraph.js";

class IO {
  constructor(id, type = "any", allowConnections = true, isInput = true) {
    this.id = id;
    this.type = type;
    this.value = null;

    this.rootElement = this._createIOContainer();

    this.node = null;
    this.isInput = isInput;
    this.allowConnections = allowConnections;
    this.canEdit = true;

    // Inputs: single connection, Outputs: multiple
    this.connections = [];
  }

  _createIOContainer() {
    const io = document.createElement("div");
    io.className = "io";
    return io;
  }

  setCanEdit(canEdit) {
    this.canEdit = canEdit;
  }
  onSetCanEdit(canEdit) {}

  // Create IO element
  mount() {
    const socket = document.createElement("div");
    socket.className = "io-socket";

    if (this.allowConnections && this.isInput) this.rootElement.appendChild(socket);
    const ioEle = this.onMount();
    ioEle.style.gridColumn = "2";
    this.rootElement.appendChild(ioEle);
    if (this.allowConnections && !this.isInput) this.rootElement.appendChild(socket);
    this.socketElement = socket;
    this.setSocketColor();

    // Set socket color based on type

    // In your IO class, after creating socketElement
    this.socketElement.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      if (this.isInput) {
        // This is input, get output from connection if there is one
        if (this.connections.length === 0) return;
        TinyGraphInstance.editConnection(this.connections[0], this);
      } else {
        // This is output, start connection from here
        TinyGraphInstance.startConnection(this);
      }
    });

    return this.rootElement;
  }

  setSocketColor() {
    let color = "#888";
    switch (this.type) {
      case "number":
        color = "#f39c12";
        break;
      case "string":
        color = "#27ae60";
        break;
      case "boolean":
        color = "#2980b9";
        break;
      case "any":
        color = "#8e44ad";
        break;
    }
    this.socketElement.style.backgroundColor = color;
  }

  onMount() {}

  setNode(node) {
    this.node = node;
  }

  // Connect this IO to another IO
  connectTo(targetIO) {
    if(!this.allowConnections) return;
    if (this.isInput) return; // Only outputs initiate connections
    if (!targetIO.isInput) return; // Can only connect to inputs

    // For input: only one connection allowed
    if (targetIO.connections.length === 0) {
      targetIO.connections.push(this);
      this.connections.push(targetIO);
    }

    this.updateConnections();
  }

  // Disconnect from another IO
  disconnectFrom(targetIO) {
    this.connections = this.connections.filter((io) => io !== targetIO);
    if (targetIO.isInput) {
      targetIO.connections = targetIO.connections.filter((io) => io !== this);
    }
  }

  
  updateConnections() {
    if (!this.isInput) {
      for (const inputIO of this.connections) {
        inputIO.setValue(this.value);
        // Do NOT call inputIO.node.compute() here!
        // Let TinyGraph handle node compute and cycle detection.
      }
    }
  }

  getValue() {
    return this.value;
  }
  
  setValue(value) {
    this.value = value;
    this.onSetValue(value);

    this.updateConnections();
  }
  onSetValue(value) {}
}

export default IO;
