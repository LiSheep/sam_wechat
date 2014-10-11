sam_wechat
==========

这是一个基于node.js和wechat( https://github.com/node-webot/wechat )框架开发的sam微信公众平台

##Get Start
```
node app.js 80 (port num)
```

本程序使用redis作为session支持，因此支持nginx等反向代理软件。

##use shell to start

forever is needed

```
./start 7000 7001 #...(ports)
```

现在这个项目被整合成新的、更完善、更有一般性的项目，传送门-》：https://github.com/1956-studio/wechat-ship
