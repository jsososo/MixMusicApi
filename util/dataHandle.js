const moment = require('moment');

class dataHandle {
  constructor(platform) {
    this.platform = platform;

    ['song', 'album', 'singer', 'playlist', 'creator', 'url', 'mv', 'top', 'comment'].forEach((k) => {
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

  get handleMap() {
    return {
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

      handle163Comment: ({ user, beReplied = [], commentId, beRepliedCommentId, time, liked, likedCount, content }) => ({
        creator: this.handleMap.handle163Creator(user),
        beReplied: beReplied.map((v) => this.handleMap.handle163Comment(v)),
        id: commentId,
        beRepliedId: beRepliedCommentId,
        time,
        liked,
        likedCount,
        content,
        platform: '163',
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

      handle163Singer: ({ id, nickname, name, picUrl, img1v1Url, alias = [], company, trans, briefDesc, introduction }) => ({
        id,
        name: name || nickname,
        picUrl: picUrl || img1v1Url || 'http://p3.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
        alias: (alias || []).length > 0 ? alias : undefined,
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

      handle163Mv: ({ id, cover, name, playCount, desc, artists, briefDesc, publishTime }) => ({
        id,
        name,
        cover,
        playCount,
        publishTime: publishTime ? moment(publishTime).valueOf() : undefined,
        desc: desc || briefDesc || undefined,
        ar: this.batchHandle(artists, 'Singer'),
        platform: '163',
      }),

      handle163Top: ({ name, id, description, coverImgUrl, trackUpdateTime, playCount }) => ({
        name,
        id,
        desc: description,
        cover: coverImgUrl,
        updated: trackUpdateTime,
        playCount,
        platform: '163',
      }),

      handleQQTop: ({ topId, label, picUrl, updateTime, listenNum }) => ({
        name: label,
        id: topId,
        cover: picUrl,
        updated: moment(updateTime).valueOf(),
        playCount: listenNum,
        platform: 'qq',
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
                       belongCD,
                       interval,
                       rank,
                       rankVal,
                       rankType,
                     }) => ({
        name: name || songname,
        id: songmid || mid,
        songid: id || songid,
        mid: songmid || mid,
        mediaId: strMediaMid,
        ar: this.batchHandle(singer, 'Singer'),
        mvId: mv.vid || vid,
        al: this.handleMap.handleQQAlbum(album),
        trackNo: belongCD !== undefined ? belongCD : index_album,
        duration: interval,
        publishTime: pubtime ? pubtime * 1000 : moment(time_public).valueOf(),
        platform: 'qq',
        br,
        url,
        rank,
        rankVal,
        rankType,
        qqId: songmid || mid,
        aId: `qq_${songmid || mid}`,
      }),

      handleQQComment: ({ avatarurl, enable_delete, nick, rootcommentuin, rootcommentnick, commentid, rootcommentcontent, middlecommentcontent, beRepliedCommentId, time, ispraise, praisenum }) => ({
        creator: this.handleMap.handleQQCreator({ avatar: avatarurl, nick, uin: rootcommentuin }),
        id: commentid,
        beRepliedId: beRepliedCommentId,
        time: time * 1000,
        liked: ispraise === undefined ? undefined : !!ispraise,
        likedCount: praisenum,
        canDelete: enable_delete,
        middlecommentcontent,
        content: middlecommentcontent ?
          (middlecommentcontent.map((r) => `回复 ${r.replyednick}：${(r.subcommentcontent || '').replace(/\\n/g, '<br/>')}`).join(' //')) :
          (rootcommentcontent || '').replace(/\\n/g, '<br/>'),
        beReplied: middlecommentcontent ? [
          {
            content: (rootcommentcontent || '').replace(/\\n/g, '<br/>'),
            creator: {
              avatar: '',
              id: rootcommentuin,
              nick: (rootcommentnick || '').replace('@', ''),
              platform: 'qq',
            }
          }
        ] : [],
        platform: 'qq',
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
                           disstid,
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
        id: disstid || content_id || tid || dissid,
        creator: this.handleMap.handleQQCreator(creator),
        userId: this.handleMap.handleQQCreator(creator).id,
        cover: imgurl || logo || cover || cover_url_medium || diss_cover,
        dirid,
        // subscribed,
        trackCount: song_count || songnum || song_cnt || song_ids.length,
        playCount: listennum || access_num ||listen_num,
        desc: introduction || desc || undefined,
        list: songlist ? this.batchHandle(songlist, 'song') : undefined,
        listId: `qq_${disstid || content_id || tid || dissid}`,
        platform: 'qq',
      }),

      handleQQCreator: ({ name, nickname, nick, qq, creator_uin, uin, uin_web, avatarUrl, avatar, hostuin, hostname }) => ({
        nick: name || nickname || nick || hostname,
        id: uin_web || qq || creator_uin || uin || hostuin,
        avatar: avatarUrl || avatar,
        platform: 'qq',
      }),

      handleQQMv: ({ v_id , name, vid, desc, cover_pic, playcnt, mv_name, mv_pic_url, singer_list, recommend, pubdate, singers, publish_date, play_count }) => ({
        id: v_id || vid,
        name: mv_name || name,
        cover: mv_pic_url || cover_pic,
        playCount: play_count || playcnt,
        desc,
        publishTime: (publish_date || (pubdate * 1000)) ? moment(publish_date || (pubdate * 1000)).valueOf() : undefined,
        ar: this.batchHandle(singer_list || singers, 'Singer'),
        platform: 'qq',
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
}

module.exports = dataHandle;
