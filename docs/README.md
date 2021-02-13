# mix-music-api

## 这又是什么项目！

大家好，我又带了一个新的后端项目，MIX MUSIC API。不同于之前的两个项目，这个项目并不直接向各个平台直接获取数据，
而是对三个已有项目来获取数据，并进行磨平字段和删除多余（我用不到的，理直气壮）字段，目前支持平台：网易云、QQ音乐、咪咕音乐

[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

[QQMusicApi](https://github.com/jsososo/QQMusicApi)

[MiguMusicApi](https://github.com/jsososo/MiguMusicApi)

目前使用该项目的前端：

[NeteaseMusic](https://github.com/jsososo/NeteaseMusic)

## 怎么用呢！

```shell script
# 假装你已经成功启动好上面三个项目
git clone git@github.com:jsososo/MixMusicApi.git

npm install

npm start
```
项目默认端口为 `3600`，可在 `bin/config.js` 中 或通过设置参数 `PORT=XXXX npm start` 修改项目的端口

同时，三个平台对应的端口也可以在 `bin/config.js` 中进行修改。

## 使用说明

所有的数据操作都在 `util/dataHandle.js` 中进行，如果你需要改成你想要的格式，直接冲进去改这里就好了。

区分平台的参数为 `_p`，各平台对应的值为 `163`, `qq`, `migu`。

## 目前支持的接口

因为这个项目本身为主要服务于 [NeteaseMusic](https://github.com/jsososo/NeteaseMusic)，（那次重构前端可精简了太多代码了），
所以很多数据格式都是以那个项目原有的结构为主，下面的请求参数也不做详细展开，如果你只是想拷贝一个 soso music，那就直接拿去用，
如果你是一个有能力进行一番魔改的，那不用写的太具体应该也能看懂了 😁

### 专辑

`/album`: `id`；返回专辑信息、歌曲列表

### 歌词

`/lyric`: `id`；返回歌词、翻译歌词

### 歌单

`/playlist`: 返回歌单信息、歌曲

`/playlist/recommend`: `login` (用户是否登陆)，返回推荐歌单

`/playlist/daily`: 返回日推歌单

`/playlist/user`: `id` 返回用户歌单（咪咕不支持）

### 搜索

`/search`: `key`（关键词）, `pageNo`, `pageSize`, `type`(具体查看`routes/search.js`)

### 歌手

`/singer`: `id`，歌手信息

`/singer/sim`: 相似歌手

`/singer/song`: 歌手歌曲

`/singer/album`: 歌手专辑

### 歌曲

`/song`: 获取歌曲信息

`/song/record`: 歌曲播放记录（仅支持网易云）

`/song/playlist`: 对歌单中歌曲增删操作

### 播放链接

`/url`: 获取歌曲播放链接

`/url/batch`: 批量获取歌曲播放链接

### 评论操作

`/comment`: 获取评论

`/comment/send`: 发送评论

`/comment/like`: 点赞/取消 评论

`/comment/del`: 删除评论