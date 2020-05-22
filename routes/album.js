module.exports = {
  async ['/']({ req, res, dataHandle, request, platform }) {
    const { id } = req.query;
    let result, resData = {};
    switch (platform) {
      case '163':
        result = await request(`album?id=${id}`);
        resData = dataHandle.album(result.album);
        resData.list = dataHandle.song(result.songs);
        return res.send({
          result: 100,
          data: resData
        });
      case 'qq':
        Promise.all([request(`album?albummid=${id}`), request(`album/songs?albummid=${id}`)])
          .then(([{ data }, { data: { list }}]) => {
            resData = dataHandle.album(data);
            resData.list = dataHandle.song(list);
            return res.send({
              result: 100,
              data: resData,
            })
          });
        break;
      case 'migu':
        result = await request(`album?id=${id}`);
        return res.send({
          result: 100,
          data: dataHandle.album(result.data),
        });
    }
  }
};
