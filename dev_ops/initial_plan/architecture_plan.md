## Drakon project acchitecture
The Drakon app will be React and Electron for a dekctop solution.
The computations vary per project, the design must be modular, flexible, and testable.

## Renderer (React) 
In this project we implement Renderer (frontend) for Drakon app.  
Renderer manages the user interface, including the drag-and-drop node graph, user interactions, and displaying results.

- **Purpose**: Provides the drag-and-drop interface and manages the graph state.
- **Key Components**:
  - **Graph UI**: Use a library like `react-flow` to handle nodes, edges (connections), drag-and-drop, and zooming. Nodes represent computation units, and edges define data flow.
  - **State Management**: Store the graph state (nodes and connections) using React’s `useState` or `useReducer`. Example state structure:
    ```json
    {
      nodes: [
        { id: "1", type: "add", position: { x: 100, y: 100 }, config: { param1: 5 } }
      ],
      connections: [
        { sourceId: "1", sourcePort: "output", targetId: "2", targetPort: "input1" }
      ]
    }
    ```
  - **Node Palette**: Displays available node types (e.g., “Add”, “Multiply”) for users to add, populated from data sent by the main process.
  - **Configuration Forms**: Allow users to configure nodes (e.g., set parameters) based on schemas provided by node types.
  - **IPC Service**: A thin layer to communicate with the main process via Electron’s IPC (Inter-Process Communication), sending graph data for computation and receiving results.
- **Libraries**:
  - `react-flow`: For the node-based UI.
  - `react-jsonschema-form` (optional): To render configuration forms dynamically based on node schemas.
