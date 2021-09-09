Polebot
=======

Simple text based game called *"pole"* in a Telegram bot.

Deploy
------

You can either run the bot directly from a host or running a Docker container:

### Docker

```sh
docker build -t polebot .
docker run --env-file=.env -d polebot
```

### Manual deploy on host

Install node.js and run:

```sh
npm install
node app.js
```

Author
------

[Jujuyeh](https://github.com/Jujuyeh)
