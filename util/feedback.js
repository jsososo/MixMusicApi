const jsonFile = require('jsonfile');

class Feedback {
  constructor({ user }) {
    jsonFile.readFile('data/app_feedback.json')
      .catch(() => {
        return [];
      })
      .then(res => {
        this.list = new Proxy(res, {
          get(target, key) {
            return target[key] || target.find(({ id }) => id === key)
          },
        })
      })

    this.user = user;
  }

  list = []

  write() {
    jsonFile.writeFileSync('data/app_feedback.json', this.list, { spaces: 2, EOL: '\r\n' });
  }

  add({ content, replyId, appId, uId, replyUId, version }) {
    const getRandom = (num) => Number(`${num}`.split('').sort((a, b) => Math.random() - 0.5).join('')).toString(36);
    const randomT = getRandom(new Date().valueOf());
    const randomN = getRandom(Math.round(Math.random() * 99999));
    this.list.unshift({
      id: randomN + randomT,
      content,
      replyId,
      replyUId,
      appId,
      uId,
      version,
      created: new Date().valueOf(),
    })
    this.write();
  }

  get(pageNo) {
    const { user } = this
    const list = this.list.filter(({ deleted }) => !deleted);
    const data = list.slice((pageNo-1) * 10, pageNo * 10).map((s) => {
      const { replyId, replyUId, uId } = s;
      const reply = replyId ? this.list[replyId] : undefined;
      const obj = { ...s };
      uId && (obj.user = user[uId]);
      if (reply) {
        obj.replyContent = reply.deleted ? '已删除' : reply.content;
        replyUId && (obj.replyUser = user[replyUId])
      }
      return obj;
    });
    return {
      list: data,
      total: list.length,
    }
  }

  del(id) {
    const f = this.list[id];
    f && (f.deleted = true);
    this.write();
  }

}

module.exports = Feedback;