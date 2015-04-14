#!/bin/bash
# /etc/init.d/minecraft
# version 0.3.6 2011-10-17 (YYYY-MM-DD) form minecraft wiki (http://minecraft.gamepedia.com/Tutorials/Server_startup_script?cookieSetup=true)
# modify by cs8425

### BEGIN INIT INFO
# Provides:   minecraft
# Required-Start: $local_fs $remote_fs
# Required-Stop:  $local_fs $remote_fs
# Should-Start:   $network
# Should-Stop:    $network
# Default-Start:  2 3 4 5
# Default-Stop:   0 1 6
# Short-Description:    Minecraft server
# Description:    Starts the minecraft server
### END INIT INFO

#Settings
SERVICE='minecraft_spigot'
SERVICE_FILE='minecraft_server.jar'
OPTIONS='nogui'
USERNAME='pi'
WORLD='world'
MCPATH='/home/pi/spigot_server'
BACKUPPATH='/home/pi/spigot_server/minecraft.backup'
CPU_COUNT=4
#INVOCATION="java -Xmx3G -Xms2G -XX:+UseConcMarkSweepGC -XX:+CMSIncrementalPacing -XX:ParallelGCThreads=$CPU_COUNT -XX:+AggressiveOpts -jar $SERVICE_FILE $OPTIONS"
INVOCATION="java -Xms256M -Xmx512M -Xmn192M -server -XX:+UseConcMarkSweepGC -XX:+UseParNewGC -XX:+CMSIncrementalPacing -XX:ParallelGCThreads=$CPU_COUNT -XX:+AggressiveOpts -jar $SERVICE_FILE $OPTIONS"

ME=`whoami`
as_user() {
  if [ $ME == $USERNAME ] ; then
    bash -c "$1"
  else
    su - $USERNAME -c "$1"
  fi
}

mc_start() {
  if  pgrep -u $USERNAME -f $SERVICE > /dev/null
  then
    echo "$SERVICE is already running!"
  else
    echo "Starting $SERVICE..."
    cd $MCPATH
    as_user "cd $MCPATH && screen -dmS $SERVICE $INVOCATION"
    sleep 7
    if pgrep -u $USERNAME -f $SERVICE > /dev/null
    then
      echo "$SERVICE is now running."
    else
      echo "Error! Could not start $SERVICE!"
    fi
  fi
}

mc_saveoff() {
  if pgrep -u $USERNAME -f $SERVICE > /dev/null
  then
    echo "$SERVICE is running... suspending saves"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"say SERVER BACKUP STARTING. Server going readonly...\"\015'"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"save-off\"\015'"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"save-all\"\015'"
    sync
    sleep 10
  else
    echo "$SERVICE is not running. Not suspending saves."
  fi
}

mc_saveon() {
  if pgrep -u $USERNAME -f $SERVICE > /dev/null
  then
    echo "$SERVICE is running... re-enabling saves"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"save-on\"\015'"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"say SERVER BACKUP ENDED. Server going read-write...\"\015'"
  else
    echo "$SERVICE is not running. Not resuming saves."
  fi
}

mc_stop() {
  if pgrep -u $USERNAME -f $SERVICE > /dev/null
  then
    echo "Stopping $SERVICE"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"say SERVER SHUTTING DOWN IN 10 SECONDS. Saving map...\"\015'"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"save-all\"\015'"
    sleep 10
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"stop\"\015'"
    sleep 7
  else
    echo "$SERVICE was not running."
  fi
  if pgrep -u $USERNAME -f $SERVICE > /dev/null
  then
    echo "Error! $SERVICE could not be stopped."
  else
    echo "$SERVICE is stopped."
  fi
}

mc_backup() {
   cd $MCPATH
   echo "Backing up minecraft world..."
   for i in world world_nether world_the_end plugins banned-ips.json ops.json spigot.yml whitelist.json banned-players.json server.properties usercache.json
   do
       if [ -d $i ]
       then
           as_user "cd $MCPATH && git add $i"
       fi
       if [ -f $i ]
       then
           as_user "cd $MCPATH && git add $i"
       fi
   done
   MSG=`date "+%Y.%m.%d %H:%M:%S"`
   as_user "cd $MCPATH && git commit -m 'auto backup @ $MSG'" >> /dev/null
   echo "Backup complete"
}

mc_command() {
  command="$1";
  if pgrep -u $USERNAME -f $SERVICE > /dev/null
  then
    pre_log_len=`wc -l "$MCPATH/logs/latest.log" | awk '{print $1}'`
    echo "$SERVICE is running... executing command"
    as_user "screen -p 0 -S $SERVICE -X eval 'stuff \"$command\"\015'"
    sleep .1 # assumes that the command will run and print to the log file in less than .1 seconds
    # print output
    tail -n $[`wc -l "$MCPATH/logs/latest.log" | awk '{print $1}'`-$pre_log_len] "$MCPATH/logs/latest.log"
  fi
}

mc_tps() {
  if pgrep -u $USERNAME -f $SERVICE > /dev/null
  then
    as_user "screen -p 0 -S $SERVICE -X stuff  'tps\n'"
    sleep 1
    tail -n 20 "$MCPATH/logs/latest.log" | grep TPS | tail -n 1
  else
    echo "$SERVICE is not running."
  fi
}

#Start-Stop here
case "$1" in
  start)
    mc_start
    ;;
  stop)
    mc_stop
    ;;
  restart)
    mc_stop
    mc_start
    ;;

  backup)
    mc_saveoff
    mc_backup
    mc_saveon
    ;;
  tps)
    mc_tps
    ;;
  status)
    if pgrep -u $USERNAME -f $SERVICE > /dev/null
    then
      echo "$SERVICE is running."
    else
      echo "$SERVICE is not running."
    fi
    ;;
  command)
    if [ $# -gt 1 ]; then
      shift
      mc_command "$*"
    else
      echo "Must specify server command (try 'help'?)"
    fi
    ;;
  cmd)
    if [ $# -gt 1 ]; then
      shift
      mc_command "$*"
    else
      echo "Must specify server command (try 'help'?)"
    fi
    ;;

  *)
  echo "Usage: $0 {start|stop|backup|status|restart|command|cmd|tps \"server command\"}"
  exit 1
  ;;
esac

exit 0
