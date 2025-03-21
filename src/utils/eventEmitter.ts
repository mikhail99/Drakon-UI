/**
 * Simple event emitter for tracking graph changes
 */
type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  // Subscribe to an event
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Unsubscribe from an event
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // Emit an event with optional arguments
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Create a singleton instance for the application to use
export const graphEvents = new EventEmitter();

// Define event names as constants
export const GRAPH_EVENTS = {
  GRAPH_CHANGED: 'graph:changed',
  NODE_ADDED: 'node:added',
  NODE_UPDATED: 'node:updated',
  NODE_REMOVED: 'node:removed',
  EDGE_ADDED: 'edge:added',
  EDGE_UPDATED: 'edge:updated',
  EDGE_REMOVED: 'edge:removed',
  GRAPH_CLEARED: 'graph:cleared',
};

export default graphEvents; 