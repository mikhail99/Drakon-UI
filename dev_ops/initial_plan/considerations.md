## Considerations

- **Flexibility**: Computation modules are project-specific and loaded dynamically, supporting varied use cases (e.g., math, data processing). Node types include schemas for UI configuration, making the system extensible.
- **Performance**: Heavy computations run in the main process (potentially using `worker_threads`), keeping the UI responsive. For large graphs, optimize later with incremental updates or selective result fetching.
- **Data Types**: Ports specify types (e.g., “number”, “string”), enforced in the UI. Outputs must be serializable (e.g., JSON-compatible) for IPC, with special handling (e.g., file paths) for large data like images if needed.
- **Asynchronous Computations**: Computation functions can return Promises, handled by the executor in the main process.