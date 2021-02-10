module.exports = {
  async ['/album']({ req, res, request, dataHandle, platform }) {
    let result;
    const { id } = req.query;
    switch (platform) {
      case '163':
        result = await request(`artist/album?offset=0&limit=100&id=${id}`);
        return res.send({
          result: 100,
          data: dataHandle.album(result.hotAlbums),
        });
      case 'qq':
        result = await request(`singer/album?singermid=${id}&pageNo=1&pageSize=100`);
        result.data.mid = id;
        return res.send({
          result: 100,
          data: dataHandle.album(result.data.list),
        });
      case 'migu':
        result = await request(`singer/albums?id=${id}&pageSize=100`);
        return res.send({
          result: 100,
          data: dataHandle.album(result.data.list),
        });
    }
  },

  async ['/song']({ req, res, dataHandle, request, platform }) {
    let result;
    const { id } = req.query;
    switch (platform) {
      case '163':
        result = await request(`artists?id=${id}`);
        return res.send({
          result: 100,
          data: dataHandle.song(result.hotSongs),
        });
      case 'qq':
        result = await request(`singer/songs?singermid=${id}&num=50`);
        result.data.mid = id;
        return res.send({
          result: 100,
          data: dataHandle.song(result.data.list),
        });
      case 'migu':
        result = await request(`singer/songs?id=${id}`);
        return res.send({
          result: 100,
          data: dataHandle.song(result.data.list),
        });
    }
  },

  async ['/sim']({ req, res, dataHandle, request, platform }) {
    let result;
    const { id } = req.query;
    switch (platform) {
      case '163':
        result = await request(`simi/artist?id=${id}`);
        return res.send({
          result: 100,
          data: dataHandle.singer(result.artists),
        });
      case 'qq':
        result = await request(`singer/sim?singermid=${id}&num=50`);
        result.data.mid = id;
        return res.send({
          result: 100,
          data: dataHandle.singer(result.data.list),
        });
      case 'migu':
        return res.send({
          result: 100,
          data: [],
        });
    }
  },

  async ['/']({ req, res, request, dataHandle, platform }) {
    let result;
    const { id } = req.query;
    switch (platform) {
      case '163':
        Promise.all([request(`artist/desc?id=${id}`), request(`artists?id=${id}`)])
          .then(([r1, r2]) => {
            return res.send({
              result: 100,
              data: dataHandle.singer({ ...r1, ...r2.artist }),
            })
          });
        break;
      case 'qq':
        result = await request(`singer/desc?singermid=${id}`);
        result.data = result.data || {};
        result.data.name = result.data.singername;
        ((result.data.basic && result.data.basic.item) || []).forEach(({ key, value}) => {
          if (key === '中文名') {
            result.data.name = value;
          }
          if (key === '外文名') {
            result.data.alias = [ value ];
          }
          if (key === '经纪公司') {
            result.data.company = value;
          }
        });
        result.data.mid = id;
        if (result.data.other && result.data.other.item) {
          result.data.intro = result.data.other.item.map(({ key, value }) => ({ ti: key, txt: value }))
        }
        return res.send({
          result: 100,
          data: dataHandle.singer(result.data),
        });
      case 'migu':
        result = await request(`singer/desc?id=${id}`);
        result.data.desc && (result.data.intro = [
          {
            ti: '',
            txt: result.data.desc || '',
          }
        ]);
        delete result.data.desc;
        return res.send({
          result: 100,
          data: dataHandle.singer(result.data),
        })
    }
  },
};
