## Making the App Easy to Test

To ensure testability, maintain a clean separation of concerns with well-defined interfaces:

1. **Renderer Process**:
   - **UI Components**: Test with Jest and React Testing Library. Mock the IPC service to simulate main process responses.
     - Example: Test that adding a node updates the graph state correctly.
   - **IPC Service**: Mock to test sending/receiving messages independently of the main process.

2. **Main Process**:
   - **Computation Functions**: Test individually with unit tests, providing mock inputs and checking outputs.
     - Example: `expect(add({ a: 2, b: 3 }, { offset: 1 })).toEqual({ sum: 6 })`.
   - **Graph Executor**: Test with mock computation functions to verify correct execution order and data flow.
     - Example: Pass a simple graph and ensure nodes compute in topological order.
   - **IPC Handler**: Mock Electron’s IPC to test message handling and responses.

3. **Integration**:
   - Use dependency injection (e.g., pass the computation registry to the executor) to mock dependencies in tests.
   - Test project loading by mocking file system access with sample computation modules and graph data.

4. **Tools**:
   - Use TypeScript to define interfaces (e.g., `NodeType`, `Graph`, `ComputationFunction`) for type safety and clearer test expectations.
   - Leverage testing frameworks like Mocha (for main process) and Jest (for renderer).