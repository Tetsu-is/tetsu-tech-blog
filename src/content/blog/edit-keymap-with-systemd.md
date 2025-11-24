---
title: "systemdを用いてCapsLockキーにCtrlキーを割り当てる"
description: "このブログではsystemd用いてkeymapを編集した方法について説明します。"
pubDate: "Nov 24 2025"
heroImage: "/og/edit-keymap-with-systemd.png"
blogID: "01KATGD1Y7QSKP7KBH35JNF41E"
---

## はじめに
この記事では私がDebianを入れてつかっているPCでCapsLockキーをCtrlキーに変更するためにsystemdを用いてkeymapを編集した方法について説明します。


**想定読者** 
- systemd使うときとかあるか？という人
- CapsLockキーなんて間違えて押したときにキャンセルするためにしか使わないという人
- PCセットアップしたら真っ先にCapsLockキーをCtrlキーに変更したいよという人

## 背景
私は研究室用のPCにDebianをインストールして使っています。XorgやLinuxのDesktop Environmentを使えば簡単にキーのリマップができるのですが、キーのリマップごときでXorgやDesktop Environmentに依存するのはダサいと思ったのでchatGPTでめっちゃ調べてリマップしました。Xorgを使ってる人は大人しくxkboptions, setxkbmapとかを使うのが良いと思います。

## うまくいった方法
先に方法を説明します。結論だけ知りたい人はこのセクションだけ読んで自分の生活に戻ってください。あなたの時間は大切です。


### 1. `/etc/keyboard/custom.kmap`というファイルを作成してCapsLockに相当するキーにCtrlを割り当てるように編集する。
```sh
cp dumpkeys /etc/keyboard/custom.kmap # dumpkeysで現在のkeymapを取り出してコピーする
```
keycode　58が左のCapsLockキーに対応しているので、これをControlに変更します。
```diff
- keycode 58 = CapsLock
+ keycode 58 = Control
```


### 2. `/etc/systemd/system/keyboard-load.service`というsystemdのサービスファイルを作成する。
```ini
[Unit]
Description=Load custom keyboard map (CapsLock -> Control)
After=local-fs.target # ファイルシステムのマウント後に実行する

[Service]
Type=oneshot # 一度だけ実行したら完了とする
ExecStart=/usr/bin/loadkeys /etc/keyboard/custom.kmap　# 実行するコマンド。loadkeysで自作のkeymapを読み込ませる
RemainAfterExit=yes # コマンド終了後もアクティブ状態であると見なす

[Install]
WantedBy=multi-user.target # マルチユーザーモードで起動する際にこのサービスを有効にする
```

### 3. systemdにサービスを登録して有効化する。
```sh
sudo systemctl daemon-reload # systemdの設定を再読み込みする
sudo systemctl enable keyboard-load.service # サービスを有効化する
sudo systemctl start keyboard-load.service # サービスを起動する
```

これでPC起動手順の中でsystemdが起動されたタイミングでリマップのコマンドが実行されてくれます。
XorgやDesktop Environment起動よりも前に実行されるので、ログイン画面やstartxの前からCapsLockキーがCtrlキーとして動作してくれるはずです。

これで明日からCaps->Ctrlをwindow systemやDEに依存せずに設定したやったという気で暮らせますね。

## ためして微妙だった方法
このセクションでは試して微妙だったやつを説明します。このセクションを読んでいるあなたは暇人のようです。

### 1. 毎回手動でloadkeysする

loadkeys custom.kmapすればキーマップを読み込んでくれるのですが、再起動すると設定がもとに戻ってしまうので微妙でした。

### 2. (`/etc/rc.local`にloadkeysを書く)

むかしのLinuxでは起動時に実行したいコマンドをrc.localに書くというしきたりがあったらしいです。最近のlinuxではrc.localを書いても実行してくれないみたいでやめました。

## systemdとは？
せっかく珍しくsystemdを触る機会を得たのでついで調べてみました。
Arch Wikiより引用
> systemd is a suite of basic building blocks for a Linux system. It provides a system and service manager that runs as PID 1 and starts the rest of the system. 

systemdはLinuxの基本的な構成要素の一つであり、プロセスID 1番として起動して他のシステムの起動や管理をしてくれるようです。

## まとめ
今回は名前は聞いたことあるけど触ったことのないsystemdを使ってcapslockキーをctrlキーにリマップしてみました。systemdにサービスという概念があること、それを記述して実行させることができることがわかりました。

## 参考文献
- [systemd - ArchWiki](https://wiki.archlinux.org/title/Systemd)