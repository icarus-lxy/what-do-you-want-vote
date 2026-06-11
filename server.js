# what do you want ?

这是一个本地可运行的匿名多选投票页面。

## 启动

最简单方式：双击 `start.bat`。

或者：

在这个文件夹里运行：

```bash
node server.js
```

然后打开：

- 投票页面：http://localhost:3000
- 后台统计：http://localhost:3000/admin.html

## 功能

- A / B 可以多选
- 每个浏览器只能提交一次
- 匿名记录，不保存姓名、手机号等信息
- 后台统计页面实时刷新
- 投票数据保存在 `data/votes.json`

## 后续加图

把图片放到 `public/images/` 文件夹里，并命名为 `result.png`。

现在的逻辑是：用户同时勾选 A 和 B 并提交后，页面会弹出 `public/images/result.png`。

如果你想改图片名字，打开 `public/index.html`，找到：

```html
<img src="/images/result.png" alt="投票后的图片" />
```

把 `/images/result.png` 改成你的图片路径。

## 清空数据

双击 `clear-data.bat` 可以清空投票数据。

如果后台统计页面已经打开，清空后刷新一下后台页面即可看到归零。

## 让不同 Wi-Fi 的人也能投票

本地链接只能给同一个 Wi-Fi 的人用。要让任何地方的人都能打开，需要公网地址。

这个项目已经带了 `package.json`，可以放到支持 Node.js 的网站托管平台运行，启动命令是：

```bash
npm start
```

也可以看 `公网发布说明.txt`。
