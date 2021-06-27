const sourceMap = {
  msuic: 0,
  mv: 1,
  playlist: 2,
  album: 3,
  dj: 4,
}

const getSouce = (source) => sourceMap[source] || 'music';

module.exports = {
  async ['/']({ req, res, dataHandle, request, platform }) {
    const { id, pageNo = 1, pageSize = 20, hot = 0, source = 'music' } = req.query;
    let result, resData = {};
    switch (platform) {
      case '163': {
        result = await request(`comment/${source}?offset=${(pageNo - 1) * pageSize}&limit=${pageSize}&id=${id}`).catch(() => ({}));
        const { total = 0, comments = [], hotComments = [] } = result;
        resData = {
          list: dataHandle.comment(hot/1 ? hotComments : comments),
          pageNo,
          pageSize,
          total,
        }
        return res.send({
          result: 100,
          data: resData
        });
      }
      case 'qq': {
        result = await request(`comment?pageNo=${pageNo}&pageSize=${pageSize}&id=${id}&type=${hot}&biztype=1`).catch(() => ({ data: { comment: {}} }));
        const { commenttotal = 0, commentlist = [] } = result.data.comment;
        resData = {
          list: dataHandle.comment(commentlist),
          pageNo,
          pageSize,
          total: commenttotal,
        }
        return res.send({
          result: 100,
          data: resData
        });
      }
      case 'migu':
        return res.send({
          result: 100,
          data: [],
        });
    }
  },

  async ['/send']({ req, res, request, platform }) {
    const { content, id, commentId, source = 'music' } = req.query;
    switch (platform) {
      case '163': {
        const result = await request({
          url: 'comment',
          data: {
            t: commentId ? 2 : 1,
            source: getSouce(source),
            commentId,
            id,
            content,
          },
          method: 'post',
        });
        return res.send({
          result: 100,
          data: result.data,
        })
      }
      case 'qq': {
        const result = await request({
          url: 'comment/send',
          data: {
            id,
            biztype: 1,
            content,
          },
          method: 'post',
        })
        return res.send({
          result: 100,
          data: result.data,
        })
      }
      case 'migu': {
        return res.send({
          reuslt: 100,
          data: true,
        })
      }
    }
  },

  async ['/like']({ req, res, request, platform }) {
    const { id, commentId, type, source = 'music' } = req.query;
    switch (platform) {
      case '163': {
        const result = await request(`comment/like?id=${id}&cid=${commentId}&t=${type}&type=${getSouce(source)}`);
        return res.send({
          result: 100,
          data: result.data
        })
      }
      case 'qq': {
        const result = await request(`comment/like?id=${commentId}&type=${type/1 === 1 ? 1 : 2}`);
        return res.send({
          result: 100,
          data: result.data
        })
      }
    }
  },

  async ['/del']({ req, res, request, platform }) {
    const { id, commentId, source = 'music' } = req.query;
    switch (platform) {
      case '163': {
        const result = await request(`comment?t=0&type=${getSouce(source)}&id=${id}&commentId=${commentId}`)
        return res.send({
          result: 100,
          data: result.data,
        })
      }
      case 'qq': {
        const result = await request(`comment/del?id=${commentId}`)
        return res.send({
          result: 100,
          data: result.data,
        })
      }
    }
  },
};
