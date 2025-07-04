---
title: "Linux入門① ディレクトリ構造"
description: "description"
pubDate: "Jul' '04' '2025"
heroImage: "/og/linux-directory-structure.png"
blogID: "01JZ8GP816B6VQ6KNJQ0P15TBD"
---

### メモ
読みおわった人の状態
- LinuxのFHSの存在と概要をしっている
- メジャーなディレクトリ名と入っているファイルの概要を説明できる

いれること
- 挨拶
- Filesystem Hierarchy Standardとは？
- メジャーなディレクトリの説明 opt,usr,bin,rootとかの意味

いれないこと
- 細かいニッチなディレクトリの話
- ファイルシステムの詳しい話
-

章分け
- FHSってなんだ
- ファイルシステム?
- root
- usr
- var

こんにちは最近サブPCにarch linuxをインストールして遊んでいる Tetsu です。
今までLinuxについて体系的に学ぶことなく使っていたのですが、
きちんと学びたいと思ったのでLinux入門シリーズとしてLinux基礎を体系的に学んでいこうと思います。

記念すべき第1回はFHSとディレクトリ構造について学んでいこうと思います。

#### 概要
この記事の目的はLinuxのディレクトリ構造を理解して使いこなせるようにすることです。
Linuxのディレクトリ構造は標準仕様であるFHSに基づいています。ですから、まずはFHSの考え方から読みといていき、
それぞれのディレクトリの意図を理解したうえで使えるようになりましょう。

#### FHSとは
FHS(Filesystem Hierarchy Standard)とはLinux Foundationに定められているLinuxのファイル、ディレクトリの
配置に関する標準仕様です。 Linuxのディストリビューションやソフトウェアは基本的にこの仕様にしたがってファイルやディレクトリを配置します。

#### FHSの基礎となる考え方
Linuxのファイルシステムで扱うファイルは2つの軸で分類することができます。
1つは「shareable or unshareable」、2つめは「static or variable」です。
shareableとは文字通り共有可能であるということです。

|  | shareable | unshareable |
| --- | --- | --- |
| **static** | /usr | /etc |
| | /opt | /boot |
| **variable** | /var/mail | /var/run |
| | /var/spool/news | /var/lock |

(表に記載されている具体例を交えて2軸を説明する)

次の章からは各ディレクトリの意味と用途をまとめていきます

#### 各ディレクトリの意味と使い方
階層構造を
(ルート階層とユーザ階層を説明する)
##### ルート階層







 
