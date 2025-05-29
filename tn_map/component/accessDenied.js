// AccessDeniedMessage.js
class AccessDeniedMessage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Create a shadow root
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <div class="message-container">
                <h1>Access Denied</h1>
                <p>This site is only available on mobile devices.</p>
            </div>
            <style>
                .message-container {
                    text-align: center;
                    padding: 20px;
                    border: 2px solid #f44336; /* Red border for emphasis */
                    border-radius: 8px;
                    background-color: #fff; /* White background for the message */
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Slight shadow for depth */
                }
                h1 {
                    color: #f44336; /* Red color for the header */
                    margin-bottom: 10px;
                }
                p {
                    margin: 0;
                }
            </style>
        `;
    }
}

// Define the new element
customElements.define('access-denied', AccessDeniedMessage);
