module.exports = {
  async ['/']({ req, res, request, platform }) {
    const { id } = req.query;
    let result;
    switch (platform) {
      case '163':
        result = await request(`lyric?id=${id}`);
        return res.send({
          result: 100,
          data: {
            lyric: result.lrc ? result.lrc.lyric : '',
            trans: (result.tlyric && result.tlyric.lyric) ? result.tlyric.lyric : undefined,
          }
        })
      case 'qq':
        result = await request(`lyric?songmid=${id}`);
        return res.send({
          result: 100,
          data: {
            lyric: result.data.lyric || '',
            trans: result.data.trans,
          }
        })
      case 'migu':
        result = await request(`lyric?cid=${id}`);
        return res.send({
          result: 100,
          data: {
            lyric: result.data,
          }
        })
    }
  }
};
