const Playlist = require('./playlist');

module.exports = {
  async ['/category']({ res, request, platform, dataHandle }) {
    let result, resData;
    switch (platform) {
      case '163':
        result = await request('toplist');
        resData = [{
          title: '云音乐特色榜',
          list: [],
        }, {
          title: '全球媒体榜',
          list: [],
        }]
        result.list.forEach((t) => {
          let top = dataHandle.top(t);
          let index = t.ToplistType ? 0 : 1;
          resData[index].list.push(top);
        })
        return res.send({
          result: 100,
          data: resData,
        });
      case 'qq':
        result = await request('top/category');
        return res.send({
          result: 100,
          data: result.data.map(({ title, list }) => ({ title, list: dataHandle.top(list) }))
        });
      default: return res.send({ result: 200 });
    }
  },

  async ['/']({ req, res, request, platform, dataHandle }) {
    const { id } = req.query;
    let result;
    switch (platform) {
      case '163':
        return res.send({
          result: 100,
          data: await Playlist["/"]({ req, request, dataHandle, platform }),
        })
      case 'qq':
        result = (await request({
          url: 'top',
          data: { id },
        })).data;
        return res.send({
          result: 100,
          data: {
            list: dataHandle.song(result.list),
            playCount: result.listenNum,
            id: id,
            name: result.info.title,
            trackCount: result.total,
            desc: result.info.desc,
            cover: result.info.picUrl,
            platform: 'qq',
          },
        })
    }
  }
}