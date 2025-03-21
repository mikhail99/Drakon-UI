### Data Flow for Drakon App

1. **Project Loading**:
   - User selects “Open Project” and chooses a directory.
   - Renderer reads `graph.json` and sets the graph state in React.
   - Renderer sends an IPC message (`load-project`) to the main process with the project directory path.
   - Main process loads computation modules from `computations/`, registers node types in the registry, and sends the list of node types (with schemas) back to the renderer via IPC.

2. **Graph Building**:
   - User adds nodes from the palette (based on available types) and connects them using the `react-flow` interface.
   - Renderer enforces type compatibility (e.g., number output to number input) using port type data from schemas.
   - Node configurations are edited via forms generated from schemas.

3. **Computation Trigger**:
   - User clicks a “Run” button.
   - Renderer serializes the graph state (nodes with types/configurations, connections) and sends it to the main process via IPC (`execute-graph`).
   - Main process:
     - Performs a topological sort on the graph (assuming no cycles for simplicity).
     - Executes each node’s computation function from the registry, passing inputs and configuration, awaiting Promises if asynchronous.
     - Collects results (e.g., `{ nodeId: { outputName: value } }`).
   - Main process sends results back to the renderer via IPC.

4. **Result Display**:
   - Renderer receives results and updates the UI, displaying outputs on nodes (e.g., showing “sum = 15” on an “Add” node).

5. **Saving**:
   - Renderer saves the current graph state to `graph.json` in the project directory when the user selects “Save”.