/**
 * Class to manage keyboard interactions
 */
let keyboardInstance = null;
class Keyboard {
	constructor() {
		this.keys = {};
		this.handlers = {};
		// TRICKY keep track of the instance (there should only be one)
		// because the window event listeners remap 'this'
		keyboardInstance = this; 

		// add event listeners for all keys
		window.addEventListener('keydown', this.keyPress);
		window.addEventListener('keyup', this.keyRelease);
	}

	/**
     * Handle a key being pressed
     * @param {event} e an event object that fires from the window 
     */
	keyPress(e) {
		e.preventDefault();
		keyboardInstance.keys[e.key] = e.timeStamp;
		keyboardInstance.update();
	}

	/**
     * Handle a key being released
     * @param {event} e an event object that fires from the window 
     */
	keyRelease(e) {
		delete keyboardInstance.keys[e.key];
	}

	/**
     * Call the event handlers for all pressed keys
     */
	update() {
		for (let key in this.keys) {
			if (this.keys.hasOwnProperty(key)) {
				if (this.handlers[key]) {
					this.handlers[key]();
				}
			}
		}
	}

	/**
     * Add a handler for when a key is pressed
     * @param {string} key the string representation of the keyboard key 
     * @param {function} handler the function that should be called when the key is pressed
     */
	registerHandler(key, handler) {
		this.handlers[key] = handler;
	}

	/**
     * Clear all handlers and keys
     */
	reset() {
		this.handlers = {};
		this.keys = {};
	}
}
