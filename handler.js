'use strict';

// ------------------------
// Bolt App Initialization
// ------------------------
const { App, ExpressReceiver } = require('@slack/bolt');
const axiosBase = require('axios');

const axios = axiosBase.create({
  baseURL: 'https://script.google.com',
});

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver,
  processBeforeResponse: true,
});

// ------------------------
// Application Logic
// ------------------------

app.command("/supply", async ({ ack, body, client }) => {
  const developerId = 'UT3MR9FQT';
  ack();

  await client.views.open({
    // 適切な trigger_id を受け取ってから 3 秒以内に渡す
    trigger_id: body.trigger_id,
    // view の値をペイロードに含む
    view: {
      type: 'modal',
      // callback_id が view を特定するための識別子
      callback_id: 'office_supplies',
      title: {
        type: 'plain_text',
        text: '備品購入依頼 for :fukuoka:'
      },
      "submit": {
        "type": "plain_text",
        "text": "依頼する"
      },
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": "現在、福岡オフィスにのみ対応してします。\n恐れ入りますが、福岡オフィス以外の方はご利用いただけません。",
            "emoji": true
          }
        },
        {
          "type": "input",
          "block_id": "name",
          "element": {
            "type": "plain_text_input",
            "action_id": "name"
          },
          "label": {
            "type": "plain_text",
            "text": "商品名"
          }
        },
        {
          "type": "input",
          "block_id": "url",
          "element": {
            "type": "plain_text_input",
            "action_id": "url"
          },
          "label": {
            "type": "plain_text",
            "text": "商品 URL"
          }
        },
        {
          "type": "input",
          "block_id": "amount",
          "element": {
            "type": "plain_text_input",
            "action_id": "amount",
            "placeholder": {
              "type": "plain_text",
              "text": "半角数字で入力。単位、カンマなし。"
            }
          },
          "label": {
            "type": "plain_text",
            "text": "金額"
          }
        },
        {
          "type": "input",
          "block_id": "count",
          "element": {
            "type": "plain_text_input",
            "action_id": "count",
            "placeholder": {
              "type": "plain_text",
              "text": "半角数字で入力。単位、カンマなし。"
            },
            "initial_value": "1"
          },
          "label": {
            "type": "plain_text",
            "text": "個数"
          }
        },
        {
          "type": "input",
          "block_id": "reason",
          "element": {
            "type": "plain_text_input",
            "action_id": "reason",
            "placeholder": {
              "type": "plain_text",
              "text": "未入力の場合は「消耗品」として処理されます。"
            }
          },
          "label": {
            "type": "plain_text",
            "text": "購入理由"
          },
          "optional": true
        },
        {
          "type": "input",
          "block_id": "remarks",
          "element": {
            "type": "plain_text_input",
            "action_id": "remarks",
            "multiline": true,
            "max_length": 200
          },
          "label": {
            "type": "plain_text",
            "text": "備考"
          },
          "optional": true
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "image",
              "image_url": "https://avatars.githubusercontent.com/u/38056766?v=4",
              "alt_text": "developer"
            },
            {
              "type": "mrkdwn",
              "text": "ご要望や不具合報告は #福岡 で <@" + developerId + "> 宛にお願いします。"
            }
          ]
        }
      ]
    }
  })
  .catch((e) => {
    console.error(e);
  })
});

app.view('office_supplies', async ({ body, ack, view, client }) => {
  await ack();

  // const channel = 'UT3MR9FQT';
  // 生活委員チャンネル ID: C0166386DBJ
  // my user id: UT3MR9FQT
  // zzz_yossiee: C016HDX4CR1
  const data = view.state.values;

  const requestBody = JSON.stringify({
    user: body.user.name,
    name: data.name.name.value,
    url: data.url.url.value,
    count: data.count.count.value,
    amount: data.amount.amount.value,
    reason: data.reason.reason.value,
    remarks: data.remarks.remarks.value
  });

  // const text = `<@${body.user.id}> さんが購入希望リストに商品を追加しました。\n`
  //   + `商品名 : ${data.name.name.value}\n`
  //   + `URL : ${data.url.url.value}\n`
  //   + `金額 : ${data.amount.amount.value}\n`
  //   + `個数 : ${data.count.count.value}\n`
  //   + `購入理由 : ${(data.reason.reason.value || '消耗品')}\n`
  //   + `備考 : ${(data.remarks.remarks.value || 'なし')}`;

  await axios.post(`/macros/s/${process.env.SPREADSHEET_ID}/exec`, requestBody)
    .then(() => { console.log('requestBody', requestBody); })
    .catch((e) => { console.log('ERROR', e)});

  // client.chat.postMessage({ channel, text })
  //   .the(() => { console.log("channel: " + channel, "text :" + text ); })
  //   .catch((e) => { console.error('ERROR', e, e.data.response_metadata); });
});

// ------------------------
// AWS Lambda handler
// ------------------------
const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(expressReceiver.app);
module.exports.app = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
}
