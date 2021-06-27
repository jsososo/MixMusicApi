module.exports = {
  async['/']({ req, res, request, dataHandle, platform }) {
    let url = 'playlist/detail';
    let result;
    let resData;
    switch (platform) {
      case '163':
        result = await request({
          url,
          data: req.query,
        });
        const trackMap = {};
        result.playlist.tracks.forEach((s) => {
          trackMap[s.id] = s;
        });
        const reqIds = [[]];
        let reqIdIndex = 0;
        const querySong = (ids) => (
          request({
            url: 'song/detail',
            data: { ids },
          })
        )
        result.playlist.trackIds.forEach((s) => {
          trackMap[s.id] = { ...s, ...(trackMap[s.id] || {}) };
          reqIds[reqIdIndex].push(s.id);
          if (reqIds[reqIdIndex].length > 200) {
            reqIdIndex += 1;
            reqIds[reqIdIndex] = [];
          }
        })
        const resArr = await Promise.all(reqIds.map((ids) => querySong(ids.join(','))))

        resArr.forEach(({ songs }) => {
          songs.forEach((s) => trackMap[s.id] = { ...s, ...(trackMap[s.id] || {}) })
        })
        result.playlist.tracks = result.playlist.trackIds.map(s => trackMap[s.id]).filter((s) => s.name);
        const data = dataHandle.playlist(result.playlist);
        res && res.send({
          result: 100,
          data,
        });
        return data;
      case 'qq':
        url = 'songlist';
        result = await request({
          url,
          data: req.query,
        });
        res && res.send({
          result: 100,
          data: {
            // result,
            ...(dataHandle.playlist(result.data)),
          },
        });
        return resData;
      case 'migu':
        url = 'playlist';
        let totalPage = 1;
        let nowPage = 1;
        while (nowPage <= totalPage) {
          try {
            result = await request({
              url,
              data: {
                ...req.query,
                pageNo: nowPage,
              },
              timeout: 3000,
            });
            if (nowPage === 1) {
              totalPage = result.data.totalPage;
              resData = dataHandle.playlist(result.data);
            } else {
              resData.list = [ ...(resData.list || []), ...dataHandle.song(result.data.list)];
            }
          } catch (err) {}
          nowPage += 1;
        }
        res && res.send({
          result: 100,
          data: resData,
        })
        return resData;
    }
  },

  // 日推
  async['/daily']({ req, res, platform, request, dataHandle }) {
    let result;
    switch (platform) {
      case '163':
        result = await request({
          url: 'recommend/songs',
          data: req.query,
        });
        if (result.code === 200) {
          return res.send({
            result: 100,
            data: dataHandle.song(result.data.dailySongs),
          })
        }
        return res.send({
          result: 200,
          errMsg: '获取日推失败',
        })
      case 'qq':
        result = await request('recommend/daily');
        if (result.result === 100) {
          return res.send({
            result: 100,
            data: dataHandle.song(result.data.songlist),
          })
        }
        return res.send(result);
      case 'migu':
        return res.send({
          result: 100,
          data: [],
        })
    }
  },

  // 推荐歌单
  async['/recommend']({ req, res, request, dataHandle, platform }) {
    const { login } = req.query;
    let result;
    switch (platform) {
      case '163':
        result = await request(Number(login) ? 'recommend/resource' : 'personalized');
        return res.send({
          result: 100,
          data: dataHandle.playlist(result.recommend || result.result || []),
        })
      case 'qq':
        result = await request('recommend/playlist/u');
        return res.send({
          result: 100,
          data: dataHandle.playlist(result.data.list || []),
        });
      case 'migu':
        result = await request('recommend/playlist');
        return res.send({
          result: 100,
          data: dataHandle.playlist(result.data.list || []),
        })
    }
  },

  async['/user']({ req, res, request, dataHandle, platform }) {
    const { id } = req.query;
    let result, resData;
    switch (platform) {
      case '163':
        result = await request({
          url: 'user/playlist',
          data: {
            uid: id,
            ...req.query,
          }
        });
        return res.send({
          result: 100,
          data: dataHandle.playlist(result.playlist || []),
        })
      case 'qq':
        Promise.all([request(`user/songlist?id=${id}&ownCookie=1`), request(`user/collect/songlist?id=${id}&ownCookie=1`)])
          .then(([{ data: { list: list1 = [], creator }}, { data: { list: list2 = []}}]) => {
            res.send({
              result: 100,
              data: dataHandle.playlist(list1.filter(s => s.tid).map(s => ({ ...s, creator })))
                .concat(dataHandle.playlist(list2)),
            })
          });
        break;
      case 'migu':
        return res.send({
          result: 100,
          data: [],
        });
    }
  },

  // 心动模式
  async['/heart']({ req, res, request, dataHandle, platform }) {
    const { id, pid } = req.query;
    let resultData;
    switch (platform) {
      case '163':
        const { data } = (await request(`playmode/intelligence/list?id=${id}&pid=${pid}`).catch(() => ({ data: []})))
        resultData = {
          result: 100,
          data: dataHandle.song(data.map(({ songInfo }) => songInfo))
        }
        break;
      default:
        resultData = {
          result: 100,
          data: [],
        }
        break;
    }

    return res.send(resultData);
  },

  async['/collect']({ req, res, request, dataHandle, platform}) {
    const { id, sub } = req.query;

    switch (platform) {
      case '163':
        const data = await request(`playlist/subscribe?id=${id}&t=${sub}`)
        res.send({
          result: Number(data.code) === 200 ? 100 : 200,
        });
        break;
      case 'qq':
        res.send(await request(`songlist/collect?id=${id}&op=${Number(sub) ? 1 : 2}`))
        break;
    }
  },
};
