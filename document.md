#### # **Q- Explain me EventSource in JavaScript**

**EventSource is a JavaScript API that allows you to receive updates from a server in real time. It is a one-way communication protocol, meaning that data can only be sent from the server to the client.**

EventSource is often used to implement features such as:

-  Real-time chat
-  Live updates of stock prices
-  Feeds of social media updates
-  Notifications of new blog posts

To use EventSource, you first need to create an EventSource object. This object takes the URL of the server that is sending the updates as its argument.

    `const eventSource = new EventSource("https://example.com/updates");`

Once you have created an EventSource object, you can listen for events. Events are triggered when the server sends an update.

    eventSource.addEventListener("message", (event) => {
      console.log(event.data);
    });

The event.data property contains the data that was sent by the server.

Here is an example of a use case for EventSource:

You can use EventSource to create a real-time chat application. In this application, the server would send updates whenever a new message is sent. The client would then listen for these updates and display them in the chat window.

**Here is the code for the server side:**

    const eventSource = new EventSource("https://example.com/chat");

    eventSource.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      // Send the message to all clients
      eventSource.send(JSON.stringify({ message: message }));
    });

**Here is the code for the client side:**

    const eventSource = new EventSource("https://example.com/chat");

    eventSource.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      // Display the message in the chat window
    });

This is just a simple example of how EventSource can be used. There are many other possible use cases for this API.-
