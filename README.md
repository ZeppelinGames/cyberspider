# CyberSpider

### Creating Custom IO
All IO should extend the `IO` class and contain a constructor that takes 1 argument (id)
```js
export default class CustomIO extends IO {
    constructor(id) {
        // Define an output 'type' for your IO. This does not have to be a real type, e.g number
        super(id, "type");
    }
}
```  

IO have a few functions to override including:
```js
// Return true/false depending on if the value of the IO is valid
validate()

// Called when the IO is added to a GraphNode
onMount()

// Called when the 'edit state' of the IO changed. Enabled and disable users modifying data here
onSetCanEdit()

// Update elements that should be updated when the value of the IO changes
onSetValue()
```


### Creating Custom Nodes  
All nodes should extend the `GraphNode` class and contain a constructor that takes 2 arguments (x, y)
```js
export default class CustomNode extends GraphNode {
    constructor(x,y) {
        super("CustomNode", x, y);
    }
}
```

All nodes have to be registered, which is done in `Nodes.js`
```js
// class, id, name, context menu path
tinyGraph.registerNodeType(CustomNode, "CustomNode", "Custom Node", "/Custom Group/");
```  

GraphNodes have a few functions to override including:
```js
//Return true/false depending on if all values are valid for computation
validate()

//This is where the output values of your node should be set. Called when the node graph updates 
onCompute()
```
