MightyByte Backend Challenge

The code should be written in JavaScript/TypeScript.

IMPORTANT: After finishing the project, please invite khrystal@mightybyte.us, hovhannes@mightybyte.us, Acercobra and rodrigo@mightybyte.us to your GitHub repository.

Please direct any questions to khrystal@mightybyte.us, james@mightybyte.us & rodrigo@mightybyte.us.

Please send your final response to khrystal@mightybyte.us, hovhannes@mightybyte.us, rodrigo@mightybyte.us, james@mightybyte.us, and dan@mightybyte.us.

Please include a brief note describing the role (if any) that AI tools (e.g., ChatGPT, Copilot, etc.) played in how you approached or completed this assignment.



Build an app server and implement a POST request endpoint (/url) that receives a URL through a parameter called "url". This endpoint will shorten the URL following the rules below:
 Generate a random 5 character code that accepts both letters and numbers.
 Append the generated code to the server's base URL (e.g. localhost, 127.0.0.1).
 Associate the above result with the URL sent by the client and persist it. Don't use a database for this, but consider that read/write operations will be asynchronous.

After shortening the URL, the server has to return the result to the client, but not through the request's response. Feel free to choose any protocol to achieve this. Be prepared to receive a response back from the client through the same protocol acknowledging that it has received the result. Also consider that the client may not acknowledge back due to connection issues (unstable connection, temporary connection loss, etc.), so if that is the case, the server needs to take any actions necessary to ensure the result gets delivered to the client.

The client will then be able to make a GET request using the shortened URL and the server will return a JSON object with a key called "url" pointing to the original URL.

Example:
Client: POST http://localhost:3000/url params: {"url": "classcalc.com"}
Server generates shortened URL: http://localhost:3000/a2b34
Server: Sends back to the client (not through the above HTTP Request's response) {"shortenedURL": "http://localhost:3000/a2b34"}
Client: GET http://localhost:3000/a2b34
Server: Returns the following response to the GET request above - {"url": "classcalc.com"}