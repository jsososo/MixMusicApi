module.exports = {
  async ['/']({ req, res, request, dataHandle, platform }) {
    const { key, pageNo = 1, pageSize = 20, type = 0 } = req.query;
    const typeMap = {
      val: {
        0: 'song', // 单曲
        1: 'playlist', // 歌单
        2: 'album', // 专辑
        3: 'artist', // 歌手
        // 4: 'song', // lyric
        5: 'mv', // mv
      },
      qq: {
        0: 0,
        1: 2,
        2: 8,
        3: 9,
        4: 7,
        5: 12,
      },
      163: {
        0: 1,
        1: 1000,
        2: 10,
        3: 100,
        4: 1006,
        5: 1004,
      },
      migu: {
        0: 'song',
        1: 'playlist',
        2: 'album',
        3: 'singer',
        4: 'lyric',
        5: 'mv',
      }
    };
    const data = {
      qq: { ...req.query, t: typeMap.qq[type] },
      migu: { ...req.query, keyword: key, type: typeMap.migu[type] },
      163: { keywords: key, offset: (pageNo - 1) * pageSize, limit: pageSize, type: typeMap[163][type] },
    }[platform];
    const result = await request({
      url: 'search',
      data,
    });

    let list;
    let total = 0;
    let typeKey = typeMap.val[type];
    switch (platform) {
      case '163':
        list = result.result[`${typeKey}s`] || [];
        total = result.result[`${typeKey}Count`] || 0;
        break;
      case 'qq':
      case 'migu':
        list = result.data.list;
        total = result.data.total;
        break;
    }

    if (typeKey === 'artist') {
      typeKey = 'singer';
    }
    if (typeKey === 'song' && platform === '163') {
      const { songs } = await request({
        url: 'song/detail',
        data: { ids: list.map(({ id }) => id).join(',')}
      });
      list = songs;
    }

    const resData = {
      list: dataHandle[typeKey](list),
      pageNo,
      pageSize,
      total,
      key: typeKey,
      type,
    }
    res && res.send({
      result: 100,
      data: resData,
    });
    return resData;
  }
};
