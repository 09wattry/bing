# MS Rewards Generator

This is an application to automatically gather points from using Microsoft Bing.

# Prerequisites

1. Google Chrome Browser
2. Logged in session on https://www.bing.com/
3. NodeJs
4. [Bing Cookies](https://github.com/09wattry/bing-cookies)
5. .env file in the root of the project.

# Installation

1. Setup Bing cookies and make sure your cookies are output to your respective directory.
2. Run ```npm install ```
3. Setup these environment variables

Suggested config:
```
BASE_URL=http://www.bing.com/
CONFIG_PATH=$HOME/.bing
COOKIE_FILE_NAME=cookie.txt
USED_SENTENCES_FILE_PATH=$CONFIG_PATH/used-sentences.txt
MODE=local
```
