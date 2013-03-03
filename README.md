ninja-wifi-scanner
==================

[NinjaBlocks](http://ninjablocks.com) wifi scanning module.


install airodump
----------------

```bash
apt-get install build-essential libssl-dev
wget http://download.aircrack-ng.org/aircrack-ng-1.1.tar.gz
tar -zxvf aircrack-ng-1.1.tar.gz
cd aircrack-ng-1.1
sed -i 's/CFLAGS          ?= -g -W -Wall -Werror -O3/CFLAGS          ?= -g -W -Wall -O3/' common.mak
make
sudo make install
```

Tested with a [AWUS036H](http://www.amazon.com/s/field-keywords=awus036h).  You will may need to `apt-get install iw` first.


running airodump
----------------

Currently you need to do this little song and dance manually.

```bash
sudo airmon-ng start wlan0
sudo airodump-ng mon0 -w dump --output-format=csv
```
