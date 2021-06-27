module.exports = {
  async ['/category']({ res, request, platform }) {
    switch (platform) {
      case '163': {
        const result = await request('dj/catelist').catch(() => ({}))
        const data = (result.categories || []).map(({ picIPadUrl, name, id }) => ({ name, id }));
        data.unshift({ name: '推荐', id: '-1' });
        res.send({
          result: 100,
          data,
        });
        break;
      }
      case 'qq': {
        const result = await request('radio/category').catch(() => ({}))
        res.send({
          result: 100,
          data: (result.data || []).map(({ id, title }) => ({ name: title, id }))
        })
        break;
      }
    }
  },

  async ['/list']({ req, res, request, platform }) {
    const { id } = req.query;
    switch (platform) {
      case '163': {
        const result = await request(id/1 === -1 ? 'dj/recommend' : `dj/radio/hot?cateId=${id}&limit=60`).catch(() => ({}))
        res.send({
          result: 100,
          data: (result.djRadios || []).map(({ id, dj = {}, picUrl, name, rcmdtext, programCount, playCount }) => ({
            id,
            name,
            picUrl,
            trackCount: programCount,
            playCount,
            platform: '163',
            creator: {
              platform: '163',
              id: dj.userId,
              nick: dj.nickname,
              avatar: dj.avatarUrl,
            },
            desc: rcmdtext,
          }))
        });
        break;
      }
      case 'qq': {
        const result = await request('radio/category').catch(() => ({}));
        const cate = (result.data || []).find(({ id: cateId }) => cateId/1 === id/1) || {};
        res.send({
          result: 100,
          data: (cate.list || []).map(({ id, title, pic_url, listenNum }) => ({
            id,
            name: title,
            picUrl: pic_url,
            playCount: listenNum,
            platform: 'qq',
            creator: { platform: 'qq' },
          })),
        })
        break;
      }
    }
  },

  async ['/songs']({ req, res, request, platform, dataHandle }) {
    const { id } = req.query;
    switch (platform) {
      case '163': {
        const data = await request(`dj/program?rid=${id}&limit=1000`).catch(() => ({}));
        const songs = (data.programs || []).map(({ mainSong, dj, radio, id }) => {
          dj && (mainSong.artists = [dj]);
          (mainSong.album && radio && radio.picUrl) && (mainSong.album.picUrl = radio.picUrl);
          mainSong.radioId = id;
          return mainSong;
        }).filter((v) => v);
        res.send({
          result: 100,
          data: dataHandle.song(songs).map((v, i) => {
            v['163_radio'] = true;
            v.radioId = songs[i].radioId;
            (v.ar || []).forEach((a) => a['163_dj'] = true);
            return v;
          }),
          a: data,
        })
        break;
      }
      case 'qq': {
        const { data = {} } = await request(`radio?id=${id}`).catch(() => ({}));
        res.send({
          result: 100,
          data: dataHandle.song(data.tracks || []),
        })
        break;
      }
    }
  },

  async ['/private']({ res, request, platform, dataHandle }) {
    switch (platform) {
      case '163': {
        const { data } = await request(`personal/fm?t=${Date.now()}`);
        res.send({
          result: 100,
          data: dataHandle.song(data),
        })
        break;
      }
      case 'qq': {
        const { data = {} } = await request(`radio?id=99`).catch(() => ({}));
        res.send({
          result: 100,
          data: dataHandle.song(data.tracks || []),
        })
      }
    }
  },

  async ['/heart']({ req, res, request, platform, dataHandle }) {
    const { id, pid } = req.query;
    switch (platform) {
      case '163': {
        const { data = [] } = await request(`playmode/intelligence/list?id=${id}&pid=${pid}`);
        res.send({
          result: 100,
          data: dataHandle.song(data.map(({ songInfo }) => songInfo)),
        })
        break;
      }
    }
  },
}