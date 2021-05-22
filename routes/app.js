
module.exports = {
  async['/user']({ req, res, user }) {
    const { id } = req.query;

    res.send({
      result: 100,
      data: user[id],
    })
  },

  async['/user/create']({ req, res, user }) {
    const { nick, qqId, netId, email  } = req.query;

    res.send({
      result: 100,
      data: user.create({ nick, qqId, netId, email })
    })
  },

  async['/user/bind']({ req, res, user }) {
    const { id, qqId, netId } = req.query;
    res.send({
      result: 100,
      data: user.bind({ id, qqId, netId }),
    })
  },

  async['/user/update']({ req, res, user }) {
    const { id, nick, email } = req.query;
    res.send({
      result: 100,
      data: user.update({ id, nick, email }),
    })
  },

  async['/feedback']({ req, res, feedback }) {
    const { pageNo = 1 } = req.query;
    res.send({
      result: 100,
      data: feedback.get(pageNo)
    })
  },

  async['/feedback/add']({ req, res, feedback }) {
    res.send({
      result: 100,
      data: feedback.add(req.query)
    })
  },
  async['/feedback/del']({ req, res, feedback }) {
    res.send({
      result: 100,
      data: feedback.del(req.query.id)
    })
  },

  async['/version']({ res, version }) {
    res.send({
      result: 100,
      data: version.list.filter(({ deleted }) => !deleted),
    })
  },

  async['/version/check']({req, res, version }) {
    res.send({
      result: 100,
      data: version.check(req.query.version, !!Number(req.query.test || 0)),
    })
  },

  async['/version/add']({ req, res, version }) {
    version.add(req.query)
    res.send({
      result: 100,
    })
  },

  async['/version/del']({ req, res, version }) {
    version.del(req.query.version);
    res.send({
      result: 100,
    })
  }
}
