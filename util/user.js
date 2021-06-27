const jsonFile = require('jsonfile');

class User {
  constructor() {
    jsonFile.readFile('data/app_user.json')
      .catch(() => {
        return [];
      })
      .then(res => {
        this.users = new Proxy(res, {
          get(target, key) {
            if (target[key]) {
              return target[key]
            }
            return target.find((u) =>
              u.id === key ||
              u.qqId === key ||
              u.netId === key
            )
          }
        })
      })

    return new Proxy(this, {
      get(target, key) {
        return target[key] ? target[key] : target.users[key];
      }
    })
  }

  write() {
    jsonFile.writeFileSync('data/app_user.json', this.users, { spaces: 2, EOL: '\r\n' });
  }

  users = []

  create({ nick, qqId, netId, email }) {
    const { users } = this;
    let u = users[qqId] || users[netId];

    if (!u) {
      // 创建一个新的 id
      const getRandom = (num) => Number(`${num}`.split('').sort((a, b) => Math.random() - 0.5).join('')).toString(36);
      const randomT = getRandom(new Date().valueOf());
      const randomN = getRandom(Math.round(Math.random() * 99999));
      u = {
        id: randomT + randomN,
        qqId,
        netId,
        email,
        nick,
        created: new Date().valueOf(),
      }
      users.push(u);
    }

    this.write();
    return u;
  }

  bind({ id, qqId, netId }) {
    const { users } = this;
    const u = users[id] || { id };

    if (qqId) {
      const qqUser = users[qqId];
      qqUser && (delete qqUser.qqId);
      u.qqId = qqId;
    }

    if (netId) {
      const netUser = users[netId];
      netUser && (delete netUser.netId)
      u.netId = netId;
    }

    this.write();
    return u;
  }

  update({ id, nick, email }) {
    const { users } = this;
    const u = users[id];

    u && nick && (u.nick = nick);
    u && email && (u.email = email);

    this.write();
    return u;
  }

}

module.exports = User;