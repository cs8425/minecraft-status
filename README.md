#minecraft-status

This is a simple log & watch system for Minecraft server with a simple message board.

##TODO
 - remove shell dependency
 - add some css and theme


###Install
  Install node.js, and
> $ git clone https://github.com/cs8425/minecraft-status.git
> $ cd minecraft-status/
> $ git checkout message-board
> $ npm install

  The helper script need `screen` command.

###Config

edit `app.js`:
```
var config = {
	port: 8080,	// your web page port here!
	db: 'board.json',	// your db file (can be written)
	helper: '/home/pi/spigot_server/minecraft.sh',	// location of helper script (minecraft.sh)
	mcport: 25565	// your minecraft server port here!
};
```

edit `minecraft.sh` at line 19 ~ 28

###Run
> node app.js


