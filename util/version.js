const jsonFile = require('jsonfile');

class Version {
  constructor() {
    jsonFile.readFile('data/app_version.json')
      .catch(() => {
        return [];
      })
      .then(res => {
        this.list = new Proxy(res, {
          get(target, key) {
            return target[key] || target.find(({ version }) => version === key)
          },
        })
      })
  }

  list = []

  write() {
    jsonFile.writeFileSync('data/app_version.json', this.list, { spaces: 2, EOL: '\r\n' });
  }

  add({ version, versionType, explain, created }) {
    const v = this.list[version];

    if (v) {
      v.version = v;
      v.versionType = versionType;
      v.explain = explain;
      v.created = created;
      v.deleted = false;
    } else {
      this.list.unshift({
        version,
        versionType,
        explain,
        created,
      })
    }
    this.write();
  }

  del(version) {
    const v = this.list[version];
    v && (v.deleted = true);
  }

  check(v, test) {
    const explains = [];
    let newV = '';
    const compareVersion = (v1, v2) => {
      const [a1, a2] = [v1.split('.'), v2.split('.')];
      let [result, i] = [undefined, 0];
      while (result === undefined && i < a1.length && i < a2.length) {
        if (Number(a1[i]) > Number(a2[i])) {
          result = true;
        }
        if (Number(a1[i]) < Number(a2[i])) {
          result = false;
        }
        i++
      }
      return (result === undefined) ? a1.length >= a2.length : result;
    }
    this.list.find(({ version, explain, versionType, deleted }) => {
      if (deleted) {
        return false;
      }
      if (compareVersion(v, version)) {
        return true;
      }
      if (!newV && (test || (versionType === 'rc' || versionType === 'ga' || !versionType))) {
        newV = version;
      }
      newV && explains.push(explain);
      if (explains.length >= 3) {
        explains.push('...');
        return true;
      }
      return false;
    })
    if (newV) {
      return {
        version: newV,
        explain: explains.join('\n'),
      }
    }
    return undefined;
  }

}

module.exports = Version;