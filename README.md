## Description

A proof of concept of a Rock Paper Scissors game, built with Node.js ([NestJS](https://nestjs.com/)) and Vanilla JS.

### Why this project
The main goal of this project was to experiment beyond the comfort zone of my day-to-day work.
With a background strongly focused on PHP within the WordPress ecosystem, I used this application to get hands-on experience with a different stack (TypeScript, Jest, Node.js, NestJS, TailwindCSS) and with architectural decisions I am not usually exposed to (single-page applications and real-time communication).

Some architectural choices—such as in-memory storage, JWTs with no expiration, and the absence of a database—may appear poor (and they are).
However, since this project is intended purely as a proof of concept and a playground, I had to make some trade-off decision because of the limited time.

## Play the game

Check it out online [here](https://rock-paper-scissors-backend-node-production.up.railway.app/).

### Do you want to try it locally?

Clone the project, then install the dependencies:

```bash
npm install
```

Compile and run the project:

```bash
# build the assets
$ npm run build

# run the local server
$ npm run start
```

Enjoy the game at http://localhost:3000.

## The project in detail

This repository was originally intended to be used only for the back-end of the game, with the front-end developed and deployed separately.  
However, for now, the front-end is also included here for simplicity and is served as a static asset from the `/public` folder.

Front-end scripts were kept as simple as possible before the porting of the repository, so they are still written in pure Vanilla JS with minimal abstraction.
Styles are produced using [TailwindCSS](https://tailwindcss.com/).

The back-end runs a Node.js server powered by the [NestJS](https://nestjs.com/) framework.  
It is split into modules that handle user authentication and game logic.  
It exposes REST API endpoints and WebSocket listeners that the front-end uses to communicate with it.

### Limitations of the PoC

The only available authentication system is a form of guest access.  
Once a nickname is entered (which must be unique), a user object is generated and stored in memory,
and an access token is signed using JWT (with no expiration) and stored in an HTTPOnly cookie (with one day expiration).
No refresh token system is implemented.

This means two things:
1. On every application crash or redeploy, all users will be logged out.
2. There is no way for users to log out (well, this could actually be implemented), and there is no way for the application to invalidate user sessions.

In addition, there is no cleanup mechanism implemented for the in-memory storage. User objects (and game objects) will pile up over time.  
This also means that, if you lose your user session (because of cookie expiration or because you clear browser data), it is not possible to reuse the same nickname, as the application will consider it already in use.

### Future features

The items below are listed in no particular order.

### Technical

- [X] Increase code coverage.
- [ ] Extract the front-end into a separate repository and deploy it independently (and port it to at least TypeScript).
- [ ] Store users and games in Redis.

### UX

- [ ] Implement an actual login system using a service like [Logto](https://logto.io).
- [ ] Add an in-game timer.
- [ ] Support game rounds and a “Play again” option with the same opponent.
- [ ] Invite a friend to a game.

## Contribution

Feel free to open an [issue](https://github.com/antonioeatgoat/rock-paper-scissors-backend-node/issues) if you have any feedback, or open a PR if you want to contribute.

## Stay in touch

- Author - [Antonio Mangiacapra](https://www.linkedin.com/in/antonio-mangiacapra-bb272360/)

## License

This game is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
