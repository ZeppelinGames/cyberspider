import RegisterNodes from "./Nodes.js";

class TinyGraph {
  constructor() {
    // Setup canvas for wires
    this.canvas = document.createElement("canvas");
    this.canvas.id = "tinygraph-canvas";
    this.context = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);

    this.backgroundColor = "#222222";
    this.resize();

    // Pan state (no zoom)
    this.offsetX = 0;
    this.offsetY = 0;
    this.isPanning = false;
    this.lastPan = { x: 0, y: 0 };

    // Setup nodes
    this.nodes = [];
    this.connections = [];

    this.selectedNodes = [];
    this.isSelecting = false;
    this.selectionStart = null;
    this.selectionBox = null;

    this.nodeTypes = new Map();

    // Context menu setup
    RegisterNodes(this);
    this._createContextMenu();
    window.addEventListener("resize", () => this.resize());

    this.canvas.addEventListener("contextmenu", (e) => this._onContextMenu(e));

    // Input event listeners
    this.canvas.addEventListener("mousedown", (e) =>
      this._onCanvasMouseDown(e)
    );
    this.canvas.addEventListener("mousemove", (e) =>
      this._onCanvasMouseMove(e)
    );
    this.canvas.addEventListener("mouseup", (e) => this._onCanvasMouseUp(e));

    document.addEventListener("click", (e) => this._onClick(e));
    document.addEventListener("keydown", (e) => this._onKeyDown(e));

    // Pan event listeners
    this.canvas.addEventListener("mousedown", (e) => this._onPanStart(e));
    this.canvas.addEventListener("mousemove", (e) => this._onPanMove(e));
    this.canvas.addEventListener("mouseup", (e) => this._onPanEnd(e));
    this.canvas.addEventListener("mouseleave", (e) => this._onPanEnd(e));
  }

  // --- PAN HANDLERS (no zoom) ---

  _onPanStart(e) {
    if ((e.button === 1 || e.button === 2) && !this.isSelecting) {
      this.isPanning = true;
      this.lastPan = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }

  _onPanMove(e) {
    if (this.isPanning) {
      const dx = e.clientX - this.lastPan.x;
      const dy = e.clientY - this.lastPan.y;
      this.offsetX += dx;
      this.offsetY += dy;
      this.lastPan = { x: e.clientX, y: e.clientY };
      this._updateNodeTransforms();
      this.drawConnections();
      e.preventDefault();
    }
  }

  _onPanEnd(e) {
    this.isPanning = false;
  }

  _updateNodeTransforms() {
    for (const node of this.nodes) {
      if (node.rootElement) {
        node.rootElement.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
        node.rootElement.style.transformOrigin = "top left";
      }
    }
  }

  drawConnections() {
    this.context.setTransform(1, 0, 0, 1, 0, 0); // Reset
    this.context.setTransform(1, 0, 0, 1, this.offsetX, this.offsetY);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillRect(
      -this.offsetX,
      -this.offsetY,
      this.canvas.width,
      this.canvas.height
    );

    if (!this.connections) return;

    for (const { fromIO, toIO } of this.connections) {
      const fromPos = this.getSocketGraphPosition(fromIO);
      const toPos = this.getSocketGraphPosition(toIO);
      if (fromPos && toPos) {
        this.context.strokeStyle = "#8cf";
        this.context.lineWidth = 3;
        this.context.beginPath();
        this.context.moveTo(fromPos.x, fromPos.y);

        const dx = Math.abs(toPos.x - fromPos.x);
        const cpOffset = Math.max(40, dx * 0.5);

        this.context.bezierCurveTo(
          fromPos.x + cpOffset,
          fromPos.y,
          toPos.x - cpOffset,
          toPos.y,
          toPos.x,
          toPos.y
        );
        this.context.stroke();
      }
    }
    this.context.setTransform(1, 0, 0, 1, 0, 0); // Reset after drawing
  }

  // Helper: get socket position in graph space (not screen space)
  getSocketGraphPosition(io) {
    if (!io.socketElement) return null;
    const rect = io.socketElement.getBoundingClientRect();
    // Undo pan to get graph-local coordinates
    const x = rect.left + rect.width / 2 + window.scrollX - this.offsetX;
    const y = rect.top + rect.height / 2 + window.scrollY - this.offsetY;
    return { x, y };
  }

  // When adding/moving nodes, call this._updateNodeTransforms() after DOM changes
  addNode(node) {
    this.nodes.push(node);
    this._updateNodeTransforms();
  }

  deleteNode(node) {
    // Remove all connections related to this node
    for (const io of [...node.inputs.values(), ...node.outputs.values()]) {
      // Remove connections from TinyGraph and from connected IOs
      for (const connectedIO of io.connections.slice()) {
        this.removeConnection(
          io.isInput ? connectedIO : io,
          io.isInput ? io : connectedIO
        );
      }
    }
    // Remove node from nodes array
    this.nodes = this.nodes.filter((n) => n !== node);
    // Remove node's DOM element
    if (node.rootElement && node.rootElement.parentNode) {
      node.rootElement.parentNode.removeChild(node.rootElement);
    }
    this.drawConnections();
  }

  getRootNodes() {
    // A root node has no inputs or all its inputs have no connections
    return this.nodes.filter((node) => {
      if (node.inputs.size === 0) return true;
      for (const io of node.inputs.values()) {
        if (io.connections && io.connections.length > 0) return false;
      }
      return true;
    });
  }

  // Start computation from roots
  compute() {
    // Reset all node statuses
    this.nodes.forEach((node) => {
      node.setStatus(true, "Ok");
    });

    // Start from roots
    const roots = this.getRootNodes();
    roots.forEach((root) => this._computeNodeRecursive(root));
  }

  // Recursively compute and propagate, with path-based cycle detection
  _computeNodeRecursive(node) {
    if (!node.compute()) {
      return;
    }

    for (const outputIO of node.outputs.values()) {
      for (const inputIO of outputIO.connections) {
        if (inputIO.node) {
          this._computeNodeRecursive(inputIO.node);
        }
      }
    }
  }

  startConnection(fromIO) {
    this.pendingConnection = { fromIO };
    document.addEventListener("mousemove", this._onConnectionDrag);
    document.addEventListener("mouseup", this._onConnectionDrop);
  }

  _onConnectionDrag = (e) => {
    this.drawConnections();
    // Draw a line from fromIO to mouse
    if (this.pendingConnection && this.pendingConnection.fromIO) {
      const fromPos = this.getSocketGraphPosition(
        this.pendingConnection.fromIO
      );
      this.context.strokeStyle = "#ff0";
      this.context.lineWidth = 2;
      this.context.beginPath();
      this.context.moveTo(fromPos.x + this.offsetX, fromPos.y + this.offsetY);
      this.context.lineTo(e.clientX, e.clientY);
      this.context.stroke();
    }
  };

  _onConnectionDrop = (e) => {
    // Find IO under mouse
    for (const node of this.nodes) {
      for (const io of node.inputs.values()) {
        const rect = io.socketElement.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          // io should be input
          if (io.connections && io.connections.length > 0) {
            // Remove output -> input connection
            this.removeConnection(io.connections[0], io);
          }

          this.addConnection(this.pendingConnection.fromIO, io);
          console.log(
            "Connection made from",
            this.pendingConnection.fromIO.node.id,
            "to",
            io.node.id
          );
          break;
        }
      }
    }
    this.pendingConnection = null;

    document.removeEventListener("mousemove", this._onConnectionDrag);
    document.removeEventListener("mouseup", this._onConnectionDrop);
    this.drawConnections();
  };

  editConnection(fromIO, toIO) {
    this.removeConnection(fromIO, toIO);
    this.startConnection(fromIO);
  }

  addConnection(fromIO, toIO) {
    // Only allow output to input, and only one connection per input
    if (fromIO.isInput !== toIO.isInput && toIO.connections.length === 0) {
      // Loop through all connections to see if it connects back to this/creates a loop
      // Exit if it does

      fromIO.connectTo(toIO);
      // Do NOT call toIO.connectTo(fromIO); only outputs initiate connections
      this.connections.push({ fromIO, toIO });
      this.drawConnections();
      this.compute();
    }
  }
  removeConnection(fromIO, toIO) {
    // Remove from TinyGraph's connections array
    this.connections = this.connections.filter(
      (conn) => !(conn.fromIO === fromIO && conn.toIO === toIO)
    );
    // Remove from IO connection lists
    fromIO.connections = fromIO.connections.filter((io) => io !== toIO);
    toIO.connections = toIO.connections.filter((io) => io !== fromIO);

    toIO.setValue(null); // Clear input value on disconnect

    this.drawConnections();
  }

  _onClick(e) {
    if (this.menu && !this.menu.contains(e.target)) {
      this._hideContextMenu();
    }
  }

  _onCanvasMouseDown(e) {
    if (e.target === this.canvas && !e.shiftKey && !this.isSelecting) {
      this.selectedNodes = [];
      this.highlightSelectedNodes();
    }

    // Start selection box
    if (e.button !== 0) return; // Only left mouse
    // Only start selection if not clicking a node
    if (e.target === this.canvas) {
      this.isSelecting = true;
      this.selectionStart = { x: e.clientX, y: e.clientY };
      if (!this.selectionBox) {
        this.selectionBox = document.createElement("div");
        this.selectionBox.className = "selection-box";
        document.body.appendChild(this.selectionBox);
      }
      Object.assign(this.selectionBox.style, {
        display: "block",
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        width: `0px`,
        height: `0px`,
      });
    }
  }

  _onCanvasMouseMove(e) {
    if (!this.isSelecting || !this.selectionStart) return;
    const x1 = this.selectionStart.x;
    const y1 = this.selectionStart.y;
    const x2 = e.clientX;
    const y2 = e.clientY;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    Object.assign(this.selectionBox.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
  }

  _onCanvasMouseUp(e) {
    if (!this.isSelecting || !this.selectionStart) return;
    this.isSelecting = false;
    this.selectionBox.style.display = "none";
    const x1 = Math.min(this.selectionStart.x, e.clientX);
    const y1 = Math.min(this.selectionStart.y, e.clientY);
    const x2 = Math.max(this.selectionStart.x, e.clientX);
    const y2 = Math.max(this.selectionStart.y, e.clientY);

    // Select nodes whose rootElement is within the box
    this.selectedNodes = [];
    for (const node of this.nodes) {
      const rect = node.rootElement.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2) {
        this.selectedNodes.push(node);
      }
    }
    this.highlightSelectedNodes();
    this.selectionStart = null;
  }

  _onKeyDown(e) {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      this.selectedNodes.length > 0
    ) {
      // Make sure were not selecting an input field
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Copy to avoid mutation during iteration
      const toDelete = [...this.selectedNodes];
      toDelete.forEach((node) => this.deleteNode(node));
      this.selectedNodes = [];
      this.highlightSelectedNodes();
      e.preventDefault();
    }
  }

  _buildMenuTree() {
    const tree = {};
    for (const { id, name, path } of this.nodeTypes.values()) {
      const parts = path.replace(/^\/|\/$/g, "").split("/");
      let node = tree;
      for (const part of parts) {
        if (!part) continue;
        node[part] = node[part] || {};
        node = node[part];
      }
      // Support multiple items per group
      if (!node.__items__) node.__items__ = [];
      node.__items__.push({ id, name });
    }
    return tree;
  }

  _createContextMenu() {
    if (this.menu) this.menu.remove();
    this.menu = document.createElement("div");
    this.menu.className = "tinygraph-context-menu";

    // --- Search box ---
    const searchBox = document.createElement("input");
    searchBox.className = "tinygraph-menu-search";
    searchBox.type = "text";
    searchBox.placeholder = "Search nodes...";
    this.menu.appendChild(searchBox);

    const parentMenu = document.createElement("div");
    parentMenu.className = "tinygraph-menu-entries";
    this.menu.appendChild(parentMenu);

    const tree = this._buildMenuTree();

    const buildMenu = (node, parentMenu, filter) => {
      let hasVisible = false;
      // Show all items in this group
      if (node.__items__) {
        for (const { id, name } of node.__items__) {
          const match =
            !filter ||
            name.toLowerCase().includes(filter) ||
            id.toLowerCase().includes(filter);
          if (match) {
            const entry = document.createElement("div");
            entry.textContent = name;
            entry.style.padding = "6px 16px";
            entry.style.cursor = "pointer";
            entry.addEventListener(
              "mouseenter",
              () => (entry.style.background = "#444")
            );
            entry.addEventListener(
              "mouseleave",
              () => (entry.style.background = "none")
            );
            entry.addEventListener("mousedown", (e) => {
              e.stopPropagation();
              this._createNodeOfType(
                id,
                this.menuX - this.offsetX,
                this.menuY - this.offsetY
              );
              this._hideContextMenu();
            });
            parentMenu.appendChild(entry);
            hasVisible = true;
          }
        }
      }
      // Recursively build submenus
      for (const key in node) {
        if (key === "__items__") continue;
        const submenu = document.createElement("div");
        submenu.className = "tinygraph-menu-submenu";
        const groupDiv = document.createElement("div");
        groupDiv.className = "tinygraph-menu-group";
        groupDiv.textContent = key + " >";
        groupDiv.appendChild(submenu);

        const childVisible = buildMenu(node[key], submenu, filter);
        if (childVisible) {
          groupDiv.addEventListener("mouseenter", () => {
            submenu.style.display = "block";
            groupDiv.style.background = "#333";
          });
          groupDiv.addEventListener("mouseleave", () => {
            submenu.style.display = "none";
            groupDiv.style.background = "none";
          });
          parentMenu.appendChild(groupDiv);
          hasVisible = true;
        }
      }
      return hasVisible;
    };

    buildMenu(tree, parentMenu, "");

    searchBox.addEventListener("input", () => {
      parentMenu.innerHTML = "";
      const filter = searchBox.value.trim().toLowerCase();
      buildMenu(tree, parentMenu, filter);
    });

    document.body.appendChild(this.menu);
  }

  _createNodeOfType(id, x, y) {
    const node = this.nodeTypes.get(id);
    if (node) {
      const instance = new node.type(x, y);
      this.addNode(instance);
    }
  }

  _onContextMenu(e) {
    if (this.menu == null) {
      this._createContextMenu();
    }

    if (e.target === this.canvas) {
      e.preventDefault();
      this.menuX = e.clientX;
      this.menuY = e.clientY;
      this.menu.style.left = `${e.clientX}px`;
      this.menu.style.top = `${e.clientY}px`;
      this.menu.style.display = "block";
    }
  }

  _hideContextMenu() {
    this.menu.style.display = "none";
  }

  registerNodeType(type, id, name, path = "/") {
    if (type == null) {
      console.log(type);
      console.error("Invalid node type provided for registration." + path);
      return;
    }
    if (this.nodeTypes.has(id)) {
      console.warn(`Node type with id ${id} is already registered.`);
      return;
    }
    console.log(`Registering node type: ${id}`);
    this.nodeTypes.set(id, { id, type, name, path });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawConnections();
  }

  highlightSelectedNodes() {
    this.nodes.forEach((node) => {
      if (node.rootElement) {
        node.rootElement.classList.toggle(
          "selected",
          this.selectedNodes.includes(node)
        );
      }
    });
  }
}

const TinyGraphInstance = new TinyGraph();
export default TinyGraphInstance;
