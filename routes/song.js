module.exports = {
  async ['/']({ req, res, request, dataHandle, platform }) {
    const { id, cid } = req.query;

    let result;
    switch (platform) {
      case '163':
        result = await request({
          url: 'song/detail',
          data: { ids: id }
        });
        return res.send({
          result: 100,
          data: dataHandle.song(result.songs[0] || {}),
        })
      case 'qq':
        result = await request({
          url: 'song',
          data: { songmid: id },
        });
        return res.send({
          result: 100,
          data: dataHandle.song(result.data.track_info),
        })
      case 'migu':
        result = await request({
          url: 'song',
          data: { id, cid }
        })
        return res.send({
          result: 100,
          data: dataHandle.song(result.data),
        })
    }
  },

  async ['/record']({ req, res, request, dataHandle, platform }) {

    let result;
    switch (platform) {
      case 'qq':
      case 'migu':
        return res.send({
          result: 400,
          errMsg: '暂不支持',
        });
      case '163':
        result = await request({
          url: 'user/record',
          data: req.query,
        });
        if (result.code !== 200) {
          return res.send({
            result: 400,
            errMsg: result.msg,
          })
        }
        const list = result.weekData || result.allData;
        return res.send({
          result: 100,
          data: list.map(({ playCount, score, song }) => ({
            playCount,
            score,
            song: dataHandle.song(song),
          }))
        })
    }
  },
};
