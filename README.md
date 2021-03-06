# Office Supplies Lambda

## Setup

```sh
# node 10.13+ required
# 0) Create a new project with this template
npm i -g serverless
serverless create \
  --template-url https://github.com/seratch/serverless-slack-bolt-aws/tree/master

# 1) Slack App Configuration
# Go to https://api.slack.com/apps
#   - Create a Slash command named `/echo` (Request URL can be a dummy)
#   - Create a bot user @{bot-name}
#   - Install the app to your workspace

# 2) App Setup
npm i -g serverless
yarn install
cp .env.example .env
vi .env # set SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN
source .env
```

## Local Development

```sh
sls offline # local dev
ngrok http 3000 # on another terminal window

# Update the Request URL for the slash command with the ngrok URL

# 4) Make sure it works on Slack
#  /invite @{bot-name}
#  /echo something
```

## Deploy to AWS

```sh
yarn deploy
```
