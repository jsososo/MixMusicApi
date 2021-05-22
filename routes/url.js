const hostMap = require('../bin/config').hostMap;

module.exports = {
  async ['/']({ request, req, res, platform }) {
    let { br = '128' } = req.query;
    let url = 'song/url';
    const data = req.query;
    switch (platform) {
      case '163':
        data.br = {
          128: 128000,
          320: 320000,
          flac: 999000,
        }[br];
        data._t = new Date().valueOf()
        break;
      case 'qq':
        data.type = br;
        break;
      case 'migu':
        data.type = data.br;
        break;
    }

    const brArr = ['128', '320', 'flac'];
    let resData = {};
    const queryFunc = () => {
      request({
        url,
        data,
      }).then((result) => {
        switch (platform) {
          case '163':
            if (result.data.length) {
              resData = { url: result.data[0].url, br: result.data[0].br };
            }
            break;
          case 'qq':
            if (result.result !== 100) {
              let brIdx = brArr.indexOf(br);
              if (brIdx > 0) {
                br = brArr[brIdx - 1];
                data.type = br;
                return queryFunc();
              } else {
                resData = {};
              }
            }
            resData = {
              url: result.data,
              br: br === 'flac' ? 960000 : br * 1000,
            };
            break;
          case 'migu':
            if (!result.data) {
              let brIdx = brArr.indexOf(br);
              if (brIdx > 0) {
                br = brArr[brIdx - 1];
                data.type = br;
                return queryFunc();
              } else {
                resData = {};
              }
            }
            resData = {
              url: result.data,
              br: br === 'flac' ? 960000 : br * 1000,
            };
        }

        return res.send({
          result: 100,
          data: resData,
        });
      })
    };

    queryFunc();
  },

  async ['/batch']({ req, res, request, platform, R }) {
    const { id } = req.query;
    let result, resData = {};
    R.updateDomain(platform);
    switch (platform) {
      case '163':
        result = await request(`song/url?br=128000&id=${id}`);
        result.data.forEach((o) => o.url && !o.freeTrialInfo && (resData[o.id] = o.url));
        res && res.send({
          result: 100,
          data: resData,
        });
        return resData
      case 'qq':
        result = await request(`song/urls?id=${id}`);
        res && res.send(result);
        return result.data;
      case 'migu': {
        let idArr = id.split(',');
        await Promise.all(idArr.map((id) => request({
            trueUrl: `${hostMap.migu}/url`,
            data: {
              id,
              _p: 'migu',
            },
            timeout: 1000,
          }).then((res) => resData[id] = res.data)))
          .catch((e) => console.log('批量获取链接出错', e))

        res && res.send({
          result: 100,
          data: resData,
        })
        return resData;
      }
    }
  }
};
