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
        break;
      case 'qq':
        data.type = br;
        break;
      case 'migu':
        break;
    }

    let result;
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
            if (result.result === 100) {
              let brIdx = brArr.indexOf(br);
              let songUrl = '';
              do {
                let brKey = br === 'flac' ? 'flac' : `${br}k`;
                brIdx = brArr.indexOf(br);
                songUrl = result.data[brKey];
                resData = {
                  url: songUrl,
                  picUrl: result.data.pic,
                  br: br === 'flac' ? 960000 : br * 1000,
                };
                brIdx -= 1;
                if (brIdx > 0) {
                  br = brArr[brIdx];
                }
              } while (!songUrl && brIdx >= 0);
            }
        }

        return res.send({
          result: 100,
          data: resData,
        });
      })
    };

    queryFunc();
  },

  async ['/batch']({ req, res, request, platform }) {
    const { id } = req.query;
    let result, resData = {};
    switch (platform) {
      case '163':
        result = await request(`song/url?id=${id}`);
        result.data.forEach((o) => o.url && (resData[o.id] = o.url));
        return res.send({
          result: 100,
          data: resData,
        });
      case 'qq':
        result = await request(`song/urls?id=${id}`);
        return res.send(result);
      case 'migu': {
        let idArr = id.split(','), count = 0;
        Promise.all(idArr.map((v) => {
          const [a, b] = v.split('_');
          return request({
            trueUrl: `http://127.0.0.1:3600/url`,
            data: {
              id: a,
              cid: b,
              needPic: 1,
              _p: 'migu',
            },
            timeout: 1000,
          }).then((res) => resData[a] = res.data)
        })).then(() => {
          res.send({
            result: 100,
            data: resData,
          })
        }, (e) => {
          console.log('批量获取链接出错', e);
        });
      }
    }
  }
};
