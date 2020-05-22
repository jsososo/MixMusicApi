const axios = require('axios');
const StringHelper = require('./StringHelper');
const hostMap = require('../bin/config').hostMap;

class Request {
  constructor({ req, res }) {
    const { platform } = req.query;
    this.domain = hostMap[platform];
    this.req = req;
    this.res = res;
  }

  request = async (obj) => {
    try {
      if (typeof obj === 'string') {
        obj = {
          url: obj,
          data: {},
        }
      }
      obj.method = obj.method || 'get';

      let { url, data, trueUrl } = obj;

      url = `${this.domain}/${url}`;

      trueUrl && (url = trueUrl);

      if (obj.method === 'get') {
        obj.url = StringHelper.changeUrlQuery(data, url);
        delete obj.data;
      }

      obj.headers = this.req.headers;

      const res = await axios(obj);

      return res.data;
    } catch (err) {
      if (err.message.indexOf('timeout') > -1) {
        return {};
      }
      this.res.send(err.response.data);
    }
  }
}

module.exports = Request;