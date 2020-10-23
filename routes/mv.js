module.exports = {
  async ['/']({ req, res, platform, request, dataHandle }) {
    const { id } = req.query;
    let result;
    switch (platform) {
      case '163':
        Promise.all([request(`mv/detail?mvid=${id}`), request(`simi/mv?mvid=${id}`), request(`mv/url?id=${id}`)])
          .then(([res1, res2, res3]) => {
            res.send({
              result: 100,
              data: {
                ...dataHandle.mv(res1.data),
                url: res3.data.url,
                recommend: dataHandle.mv(res2.mvs),
              }
            })
          })
        break;
      case 'qq':
        Promise.all([request(`mv?id=${id}`), request(`mv/url?id=${id}`)])
          .then(([res1, res2]) => {
            res.send({
              result: 100,
              data: {
                ...dataHandle.mv(res1.data.info),
                url: (res2.data[id] || []).pop(),
                recommend: dataHandle.mv(res1.data.recommend),
              }
            })
          })
        break;
      default:
        return res.send({ result: 500 });
    }
  }
}