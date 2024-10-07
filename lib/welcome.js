const fs = require('fs');
const { Telegraph } = require('./uploader');
const { getRandom, smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, delay, sleep } = require('./myfunc');
const { isSetWelcome, getTextSetWelcome } = require('./setwelcome');
const { isSetLeft, getTextSetLeft } = require('./setleft');
let set_welcome_db = JSON.parse(fs.readFileSync('./database/set_welcome.json'));
let set_left_db = JSON.parse(fs.readFileSync('./database/set_left.json'));
let setting = JSON.parse(fs.readFileSync('./config.json'));
const welcome2 = setting.auto_welcomeMsg;
const leave2 = setting.auto_leaveMsg;
const {
  proto,
  jidDecode,
  jidNormalizedUser,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
} = require('@whiskeysockets/baileys');
const moment = require('moment-timezone');

module.exports.welcome = async (iswel, isleft, NanoBotz, anu) => {
  try {
    const metadata = await NanoBotz.groupMetadata(anu.id);
    const participants = anu.participants;
    const memeg = metadata.participants.length;
    const groupName = metadata.subject;
    const groupDesc = metadata.desc;

    for (let num of participants) {
      const fkontaku = { 
        key: { 
          participant: `0@s.whatsapp.net`, 
          ...(anu.id ? { remoteJid: `6283136505591-1614953337@g.us` } : {}) 
        }, 
        message: { 
          'contactMessage': { 
            'displayName': ``, 
            'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;,;;;\nFN:,\nitem1.TEL;waid=${num.split('@')[0]}:${num.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`, 
            'jpegThumbnail': setting.pathimg, 
            thumbnail: setting.pathimg, 
            sendEphemeral: true 
          } 
        } 
      };

      let pp_user, ppgroup;
      try {
        pp_user = await NanoBotz.profilePictureUrl(num, 'image');
      } catch {
        pp_user = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg';
      }

      try {
        ppgroup = await NanoBotz.profilePictureUrl(anu.id, 'image');
      } catch {
        ppgroup = 'https://telegra.ph/file/c3f3d2c2548cbefef1604.jpg';
      }

      if (anu.action == 'add' && (iswel || setting.auto_welcomeMsg)) {
        if (isSetWelcome(anu.id, set_welcome_db)) {
          var get_teks_welcome = await getTextSetWelcome(anu.id, set_welcome_db);
          var replace_pesan = get_teks_welcome.replace(/@user/gi, `@${num.split('@')[0]}`);
          var full_pesan = replace_pesan.replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc);
          await NanoBotz.sendMessage(anu.id, { text: `${full_pesan}`, mentions: [num] });
        } else {
          var text = `Hallo @${num.split('@')[0]}\nSelamat Bergabung Di Group ${groupName}, Jangan Lupa Intro Ya!\nPatuhi Rules Yang Ada\n\n.\n${groupDesc}\n`;
          await NanoBotz.sendMessage(anu.id, {
            text: text,
            contextInfo: {
              mentionedJid: [num],
              forwardingScore: 999,
              isForwarded: true,
              "externalAdReply": {
                "showAdAttribution": true,
                "containsAutoReply": true,
                "title": `${global.botname}`,
                "body": `Selamat datang 👋🏻`,
                "previewType": "VIDEO",
                "thumbnailUrl": 'https://telegra.ph/file/49f2b139a2aff4bb934f7.jpg',
                "sourceUrl": 'https://instagram.com/jr_danzz'
              }
            }
          });
        }
      } else if (anu.action == 'remove' && (isleft || setting.auto_leaveMsg)) {
        if (isSetLeft(anu.id, set_left_db)) {
          var get_teks_left = await getTextSetLeft(anu.id, set_left_db);
          var replace_pesan = get_teks_left.replace(/@user/gi, `@${num.split('@')[0]}`);
          var full_pesan = replace_pesan.replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc);
          await NanoBotz.sendMessage(anu.id, { image: { url: pp_user }, mentions: [num], caption: `${full_pesan}` });
        } else {
          var anubis = `Dadah @${num.split('@')[0]}\nSelamat Tinggal Dari Group ${groupName}\n!\nPatuhi Rules Yang Ada\n\n.\n${groupDesc}\n`;
          await NanoBotz.sendMessage(anu.id, {
            text: anubis,
            contextInfo: {
              mentionedJid: [num],
              forwardingScore: 999,
              isForwarded: true,
              "externalAdReply": {
                "showAdAttribution": true,
                "containsAutoReply": true,
                "title": `${global.botname}`,
                "body": `Selamat Tinggal 👋🏻`,
                "previewType": "VIDEO",
                "thumbnailUrl": 'https://telegra.ph/file/49f2b139a2aff4bb934f7.jpg',
                "sourceUrl": 'https://instagram.com/jr_danzz'
              }
            }
          });
        }
      } else if (anu.action == 'promote') {
        await NanoBotz.sendMessage(anu.id, {
          text: `Selamat @${num.split('@')[0]}\nKamu Telah Di promote Di ${groupName}\n`,
          mentions: [num]
        });
      } else if (anu.action == 'demote') {
        await NanoBotz.sendMessage(anu.id, {
          text: `Selamat Ya @${num.split('@')[0]}\nKamu telah Di Demote Dari ${groupName}\n`,
          mentions: [num]
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.aDelete = async (setting, NanoBotz, m) => {
  if (setting.antiDelete) {
    try {
      const dataChat = global.dbc;
      const mess = dataChat.find((a) => a.id == m.id);
      const mek = mess.m;
      const participant = mek.key.remoteJid.endsWith('@g.us') ? mek.key.participant : mek.key.remoteJid;
      console.log(participant);
      const froms = mek.key.remoteJid;
      await NanoBotz.sendMessage(
        froms, {
          text: `「 *ANTI DELETE MESSAGE* 」
    
📛 *Name* : ${mek.pushName}
👤 *User* : @${mek.sender.split('@')[0]}
⏰ *Clock* : ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} WIB 
✍️ *MessageType* : ${mek.mtype}
    `,
          mentions: [participant],
        }, {
          quoted: mek,
        }
      );

      await NanoBotz.copyNForward(froms, mek, true);
      await delay(4000);
      let messek = dataChat.find((a) => a.id == m.id);
      for (let [i, te] of dataChat.entries()) {
        if (te.id === m.id) {
          dataChat.splice(i, 1); // Tim is now removed from "users"
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports.oneTime = async (setting, NanoBotz, m) => {
  if (setting.antiViewOnce) {
    try {
      let teks = `「 *ANTI VIEWONCE MESSAGE* 」
      
📛 *Name* : ${m.pushName}
👤 *User* : @${m.sender.split('@')[0]}
⏰ *Clock* : ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} WIB  
✍️ *MessageType* : ${m.mtype}
💬 *Caption* : ${m.msg.caption ? m.msg.caption : 'no caption'}`;

      await NanoBotz.sendTextWithMentions(m.chat, teks, m);
      await delay(500);

      NanoBotz.copyNForward(m.chat, true, {
        readViewOnce: true,
        quoted: m,
      });
    } catch (err) {
      console.log(err);
    }
  }
};
