const moment = require('moment');

class dataHandle {
  constructor(platform) {
    this.platform = platform;

    ['song', 'album', 'singer', 'playlist', 'creator', 'url', 'mv'].forEach((k) => {
      this[k] = (data) => this.batchHandle(data, k);
    })
  }

  batchHandle(data, type) {
    const { platform, handleMap } = this;
    type = `${type.slice(0,1).toUpperCase()}${type.slice(1)}`;
    if (!data) {
      return undefined;
    }
    const isArray = data instanceof Array;
    let arr = data;
    if (!isArray) {
      arr = [ data ];
    }
    const p = {
      qq: 'QQ',
      163: '163',
      migu: 'Migu',
    }[platform];

    const result = arr.map(item => handleMap[`handle${p}${type}`](item));

    return isArray ? result : result[0];
  }

  handleMap = {
    handle163Song: ({ name, id, ar, artists, al, album, no, mv, mvid, copyrightId, publishTime, br, url, duration, dt }) => ({
      name,
      id,
      ar:  this.batchHandle(ar || artists || [],  'Singer'),
      al: this.handleMap.handle163Album(al || album || {}),
      cId: copyrightId,
      publishTime: publishTime || this.handleMap.handle163Album(al || album || {}).publishTime,
      mvId: mvid || mv,
      trackNo: no,
      platform: '163',
      duration: (duration || dt) ? Math.round((duration || dt) / 1000) : undefined,
      br,
      url,
      aId: `163_${id}`,
    }),

    handle163Album: ({ id, name, picUrl, company, publishTime, description, ar, artists, copyrightId }) => ({
      id,
      name,
      picUrl,
      company,
      platform: '163',
      publishTime,
      cId: copyrightId,
      ar: this.batchHandle(ar || artists, 'Singer'),
      desc: description || undefined,
    }),

    handle163Singer: ({ id, name, picUrl, img1v1Url, alias = [], company, trans, briefDesc, introduction }) => ({
      id,
      name,
      picUrl: picUrl || img1v1Url || 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
      alias: alias.length > 0 ? alias : undefined,
      company,
      desc: briefDesc || undefined,
      trans: trans || undefined,
      intro: introduction,
      platform: '163',
    }),

    handle163Playlist: ({ copywriter, creator, id, name, coverImgUrl, trackCount, playCount, userId, description, tracks, trackIds, picUrl }) => ({
      creator: creator ? this.handleMap.handle163Creator(creator) : undefined,
      id,
      userId,
      name,
      cover: coverImgUrl || picUrl,
      trackCount: trackIds ? trackIds.length : trackCount,
      playCount,
      desc: description || copywriter || undefined,
      list: tracks ? this.batchHandle(tracks, 'song') : undefined,
      listId: `163_${id}`,
      platform: '163',
    }),

    handle163Creator: ({ nickname, avatarUrl, userId }) => ({
      nick: nickname,
      id: userId,
      avatar: avatarUrl,
      platform: '163',
    }),

    handle163Url: ({ id, size, url, br }) => ({
      id,
      size,
      url,
      br,
    }),

    handle163Mv: ({ id, cover, name, playCount, desc, artists, briefDesc }) => ({
      id,
      name,
      cover,
      playCount,
      desc: desc || briefDesc || undefined,
      ar: this.batchHandle(artists, 'Singer'),
      platform: '163',
    }),

    handleQQSong: ({
                     singer,
                     mid,
                     id,
                     name,
                     mv = {},
                     albumid,
                     albummid,
                     albumdesc,
                     songname,
                     songid,
                     songmid,
                     strMediaMid,
                     albumname,
                     cdIdx,
                     index_album,
                     album = { id: albumid, mid: albummid, name: albumname, desc: albumdesc },
                     br,
                     pubtime,
                     time_public,
                     vid,
                     url,
                     interval,
                   }) => ({
      name: name || songname,
      id: songmid || mid,
      songid: id || songid,
      mid: songmid || mid,
      mediaId: strMediaMid,
      ar: this.batchHandle(singer, 'Singer'),
      mvId: mv.vid || vid,
      al: this.handleMap.handleQQAlbum(album),
      trackNo: cdIdx || index_album,
      duration: interval,
      publishTime: pubtime ? pubtime * 1000 : moment(time_public).valueOf(),
      platform: 'qq',
      br,
      url,
      qqId: songmid || mid,
      aId: `qq_${songmid || mid}`,
    }),

    handleQQSinger: ({ id, mid, name, singerID, singerMID, singerName, singerPic, pic, desc, intro, alias, company }) => ({
      id: id || singerID,
      name: name || singerName,
      mid: mid || singerMID,
      picUrl: singerPic || pic || ((mid || singerMID) ? `https://y.gtimg.cn/music/photo_new/T001R300x300M000${mid || singerMID}.jpg` : 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg'),
      alias: (alias && alias.length > 0) ? alias : undefined,
      company,
      // trans,
      desc: desc || undefined,
      intro: intro || undefined,
      platform: 'qq',
    }),

    handleQQAlbum: ({ id, name, mid, albumName, album_name, albumID, company, album_mid, albumMID, publicTime, singer_list, singers, desc, pub_time, ar, publishTime }) => ({
      name: name || albumName || album_name,
      id: id || albumID,
      mid: mid || albumMID || album_mid,
      picUrl: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid || albumMID || album_mid}.jpg`,
      company,
      publishTime: (publicTime || publishTime || pub_time) ? moment(publicTime || publishTime || pub_time).valueOf() : undefined,
      ar: (singer_list || singers || ar || []).length ? this.batchHandle(singer_list || singers || ar, 'Singer') : undefined,
      desc: desc || undefined,
      platform: 'qq',
    }),

    handleQQPlaylist: ({
                         dissid,
                         dissname,
                         content_id,
                         cover,
                         title,
                         username,
                         nickname,
                         headurl,
                         songlist,
                         desc,
                         logo,
                         imgurl,
                         songnum,
                         song_count,
                         listennum,
                         introduction,
                         creator_info,
                         cover_url_medium,
                         song_ids = [],
                         access_num,
                         tid,
                         song_cnt,
                         diss_name,
                         diss_cover,
                         dirid,
                         listen_num,
                         creator = creator_info || { nickname: nickname || username, avatarUrl: headurl }
                       }) => ({
      name: dissname || title || diss_name,
      id: dissid || content_id || tid,
      creator: this.handleMap.handleQQCreator(creator),
      userId: this.handleMap.handleQQCreator(creator).id,
      cover: imgurl || logo || cover || cover_url_medium || diss_cover,
      dirid,
      // subscribed,
      trackCount: song_count || songnum || song_cnt || song_ids.length,
      playCount: listennum || access_num ||listen_num,
      desc: introduction || desc || undefined,
      list: songlist ? this.batchHandle(songlist, 'song') : undefined,
      listId: `qq_${dissid || content_id || tid}`,
      platform: 'qq',
    }),

    handleQQCreator: ({ name, nickname, nick, qq, creator_uin, uin, avatarUrl, avatar, hostuin, hostname }) => ({
      nick: name || nickname || nick || hostname,
      id: qq || creator_uin || uin || hostuin,
      avatar: avatarUrl || avatar,
      platform: 'qq',
    }),

    handleQQMv: ({ mv_id, mv_name, mv_pic_url, singer_list, v_id, publish_date, play_count }) => ({
      id: mv_id,
      name: mv_name,
      cover: mv_pic_url,
      playCount: play_count,
      // desc: desc || briefDesc,
      vid: v_id,
      publishTime: publish_date ? moment(publish_date).valueOf() : undefined,
      ar: this.batchHandle(singer_list, 'Singer'),
    }),

    handleMiguSong: ({ name, id, cid, artists, album, mvId, br, url }) => ({
      name,
      id,
      ar: this.batchHandle(artists || [],  'Singer'),
      al: this.handleMap.handleMiguAlbum(album || {}),
      cId: cid,
      mvId,
      platform: 'migu',
      br,
      url,
      miguId: id,
      aId: `mig_${id}`,
    }),

    handleMiguAlbum: ({ id, name, picUrl, publishTime, artists, songList, desc, company }) => ({
      id,
      name,
      picUrl,
      publishTime: publishTime ? moment(publishTime).valueOf() : undefined,
      ar: this.batchHandle(artists, 'Singer'),
      list: songList ? this.batchHandle(songList, 'song') : undefined,
      desc: desc || undefined,
      company,
      platform: 'migu',
    }),

    handleMiguSinger: ({ id, name, picUrl, alias, company, trans, intro }) => ({
      id,
      name,
      picUrl: picUrl || 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
      intro,
      platform: 'migu',
    }),

    handleMiguPlaylist: ({ creator, id, name, intro, desc, picUrl, songCount, trackCount, playCount, list }) => ({
      id,
      userId: creator ? creator.id : undefined,
      name,
      creator: this.handleMap.handleMiguCreator(creator),
      cover: picUrl,
      trackCount: songCount || trackCount,
      playCount,
      desc: intro || desc || undefined,
      list: list ? this.batchHandle(list, 'song') : undefined,
      listId: `migu_${id}`,
      platform: 'migu',
    }),

    handleMiguCreator: ({ name, avatarUrl, id }) => ({
      nick: name || '',
      id,
      avatar: avatarUrl,
      platform: 'migu',
    }),

    handleMiguUrl: ({ id, size, url, br }) => ({
      id,
      size,
      url,
      br,
    }),

    handleMiguMv: ({ id, cover, name, playCount, desc, artists, briefDesc }) => ({
      id,
      name,
      cover,
      playCount,
      desc: desc || briefDesc || undefined,
      ar: this.batchHandle(artists, 'Singer'),
      from: 'migu',
    }),
  }
}

module.exports = dataHandle;
