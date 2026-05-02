/**
 * Simple event emitter for real-time updates across the application
 * This is used to trigger EXP updates and other global state changes
 */

class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * This is used to listen for specific events like EXP updates
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Emit an event
   * This is used to trigger updates when EXP is awarded
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Create singleton instance
const eventEmitter = new EventEmitter();

export default eventEmitter;
