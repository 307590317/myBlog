#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
echo 'www.zhaoyu.fit' > CNAME

git init
git add -A
git commit -m 'deploy'
git branch -M master

# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:307590317/307590317.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -