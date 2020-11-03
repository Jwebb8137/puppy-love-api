<h1>Puppy Love Dating App API</h1>

<img src="https://res.cloudinary.com/dvkqz0fed/image/upload/v1603930193/app/cai4gsp3nzca9vngaaox.jpg" width="200"/>

  <p>With all of the dating sites geared towards specific interests or lifestyles why hasn't this been thought of sooner? Wanting to give pet lovers a place they can connect with others I created PuppyLove. A dating app geared towards individuals with a deep passion for all things animals!</p>
  
## PERN Stack
<p>PuppyLove was built using the PERN stack as the foundation of the application. The application includes JWT authentication for login and access, a messaging feature using Twilio's Chat API (limited functionality), and image uploads are handled using Cloudinary's API. Designed with a mobile first approach the application includes a Carousel feature to browse users as well as responsive navigation and layouts.</p>

## Endpoints

### `GET /api/users`
<p>Retrieve all active users from the database.</p>

### `GET /api/users/:userid`
<p>Retrieve a specific user from the database.</p>

### `POST /api/users`
<p>Create a user and store their information in the database.</p>

### `GET /api/dashboard`
<p>Get logged in user information.</p>

### `GET /api/images`
<p>Retrieve stored images from the cloudinary API hosting app images.</p>

### `POST /api/login`
<p>Send a login request to the database.</p>

### `GET /api/target-info`
<p>Retrieve information for a target user.</p>

### `GET /api/is-verified`
<p>Check if user is authorized / has been issued a token.</p>

### `GET /api/chat-info`
<p>Retrieve chat information related to a specific chat room.</p>

### `GET /api/chatroom/info`
<p>Store information when a new chat room is created.</p>

## Additional Information
<p>This application was designed and developed as part of a full-stack project that required developing an application using the PERN stack. As my first full-stack project I expanded upon those requirements by including additional features and functionality within the application such as login authentication & use of 3rd party API's (Twilio & Cloudinary). Also worth nothing is that while working with Twilio's Chat API I did run into issues that limited my ability to incorporate a fully functioning chat feature within the application. While is does allow user's connected into the same chat room to real-time communicate and send messages to other users there is limited functionality as of this writing related to receiving messages and retrieving conversations.</p>  


