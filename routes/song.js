const port = require('../bin/config').port;
const jsonFile = require('jsonfile');

module.exports = {
  async ['/']({ req, res, request, dataHandle, platform }) {
    const { id } = req.query;

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
          data: { id }
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

  // 查找，根据关键词从其他平台获取播放链接
  async ['/find']({ req, res, request, platform }) {
    const { list = [] } = req.query;
    const { findMap } = global;

    const reqFunction = async ({ id, key, duration }) => {
      try {
        const _p = {
          163: 'qq',
          qq: '163',
          migu: 'qq',
        }[platform] || 'qq';
        if (findMap[id] !== undefined) {
          return [id, findMap[id], _p];
        }
        const queryRes = await request({
          url: 'search',
          data: {
            key,
            pageNo: 1,
            pageSize: 5,
            _p,
          },
          domain: `http://127.0.0.1:${port}`,
        });
        const findSong = (queryRes.data.list || []).find((item) => {
          if (duration) {
            return (item.duration <= duration + 3) && (item.duration >= duration - 3)
          }
          return true;
        });
        if (!findSong) {
          return [id, ''];
        }
        return [id, findSong.id, findSong.platform];
      } catch {
        return [id, ''];
      }
    }
    Promise.all(list.map((obj) => reqFunction(obj)))
      .then(async (resArr) => {
        const data = {};
        let fp = '';
        const { findMap } = global;
        resArr.forEach(([id, fId, p]) => {
          if (fId) {
            data[id] = fId;
            fp = p;
          }
          findMap[id] = fId || '';
        });
        jsonFile.writeFile('data/findMap.json', findMap);
        const urlRes = await request({
          url: 'url/batch',
          data: { id: Object.values(data).join(','), _p: fp },
          domain: `http://127.0.0.1:${port}`,
          method: 'get',
        }).catch(err => {
          console.log('song/find url res', err.message)
        });
        const sendResult = {};
        Object.keys(data).forEach((k) => {
          if (urlRes.data[data[k]]) {
            sendResult[k] = {
              url: urlRes.data[data[k]],
              bId: data[k],
              bPlatform: fp,
            };
          }
        })
        return res.send({
          result: 100,
          data: sendResult,
        });
      })
  }
};
