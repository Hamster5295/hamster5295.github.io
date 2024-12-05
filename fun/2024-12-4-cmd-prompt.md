# 让 CMD 焕然一新

作为 **行为艺术** 分类的第一篇文章，让我们以 Windows CMD Prompt 形态出战！


![最终效果](/fun/2024-12-4-cmd-prompt/preview.webp)

## TL; DR

* 使用 [`Scoop`](https://scoop.sh/) 作为包管理工具，取代安装包与手动配置 `%PATH%` 的过程
* 使用 `aria2` 与 `scoop-search` 增强 `Scoop`
* 使用 `Clink` 注入 CMD 进程，实现对 CMD Prompt 的全方位掌控
* 使用 `busybox`, `gsudo`, `vim`, `MinGW` 等工具提供 Unix 的 Shell 指令
* `figlet`, `lolcat`, `cowsay`, 以及更多好玩的！

## 为啥不用 PowerShell?
对于热爱命令行的用户来说，Windows 实在是**太糟糕了**。  
其表现之一是，不存在一个直接打开命令行的快捷键。  

这迫使我们转向替代方案：`Win`+`R`，输入 `cmd`（或者使用上一次遗留的），按回车，然后打开一个**与你正在浏览的文件夹毫无关系的**命令行。  

这里的操作已经够繁琐了，那如果换成 `PowerShell` 会如何呢？  
太糟糕了，`powershell` 总共有 **10** 个字符，是 `cmd` 的 ***3.33*** 倍。  
考虑到你不能保证自己不使用 `Win`+`R` 的其他功能，如 `regedit`, `service.msc` 或者 `gpedit`，`powershell` 这 10 个字符将与你的效率***势不两立***。  

哦，当然，别忘了他还有非常棒的 `New-Item`, `Get-Help`, `Get-ChildItem`, 等等。

## 让我们开始吧！
### Scoop
首先，让我们安装 [`Scoop`](https://scoop.sh/)。  
这是一个酷炫的、适用于 Windows 的软件包管理工具，在安装命令行工具时**特别好用**。
> 什么？你说 `Chocolatey` 和 `Winget` ?  
> 你说得对，但
> - `Chocolatey` 具备一些神奇的特性，或许已经不适合 2024 年了
> - `Winget` 本质上是一个命令行的安装包执行器，还是由**巨硬**推出的
> 
> 所以还是选择 `Scoop` 吧！


安装 `Scoop` 总体还是让人身心愉悦的。  
至少在你跟着官网的指导，把**所有东西都装进 C 盘**之前是这样。

::: warning ⚠️ 这是个陷阱！
![这是个陷阱！](/fun/2024-12-4-cmd-prompt/scoop-trap.webp)  

看到这两行诱人的脚本了吗？  
不要跑它！  

点击下面的 `Installer's Readme`, 它将会告诉你如何将 `Scoop` 以及后续所有的软件包安装到你想要的目录，而不是吃掉宝贵的 C 盘空间。
:::

在成功安装 `Scoop` 后，我们就可以使用
```shell
scoop install xxx
```
为 Windows 添加各种妙妙命令行工具了！ 

不要担心搞砸：  
只要 `scoop uninstall xxx` 发起进攻，一切都会好起来的！  
毕竟 `Scoop` 不会污染 `%PATH%`。

### Scoop 增强
`Scoop` 本身功能强大，但他还能变得更强大！  
如果你真的在照着本文进行配置，那么不妨先在控制台执行这两行命令：
```shell
scoop install aria2 scoop-search
scoop alias add s "scoop-search $args" "Shortcut for scoop search, with enhanced support"
```
然后接着往下读！

#### aria2
[`aria2`](https://aria2.github.io/manual/en/html/) 是一个**非常快**的下载工具。  
`Scoop` 内置了与 `aria2` 的集成，可以加速软件包的下载过程。  
配置非常简单：在安装 `aria2` 后，`Scoop` 将自动地使用 `aria2` 进行下载。  

别忘了，`aira2` 本身也提供命令行接口。从此告别 `wget` 吧！
```shell
aria2c 要下载的链接
```

#### scoop-search
[`scoop-search`](https://github.com/lukesampson/scoop-search) 是用于取代默认的 `scoop search` 的搜索工具。  
出于某种尚未明确的原因，`scoop search` 在部分情况下会变得**相当缓慢**。 

更深入的探讨可以参考 [这个 Issue](https://github.com/ScoopInstaller/Scoop/issues/4491)。截至目前（2024年12月），这个问题似乎仍然存在。  
作为替代方案，`scoop-search` 配合 `scoop alias` 已经可以比较完备地实现我们需要的功能了。

```shell
scoop alias add s "scoop-search $args" "Shortcut for scoop search, with enhanced support"
scoop s "要搜索的软件包"
```


### Clink
现在 `Scoop` 已经准备就绪，是时候让控制台改头换面了！
```shell
scoop install clink
```

在安装完成后，`Scoop` 会给出如下的提示：
``` txt
Run 'clink inject' to start clink on the current cmd
Run 'clink autorun install' to auto start clink
```

如其所述，执行 `clink autorun install` 后，每次启动 `cmd` ，`Clink` 将会自动注入其中。  
现在，让我们重启 `cmd`, 然后见证***魔法***!

![自动补全！](/fun/2024-12-4-cmd-prompt/auto-complete.webp)
自动补全！  

现在 `Clink` 已经可以发挥作用了。不过他还没有解锁自己的全部实力。  
在你指定 `Scoop` 的软件包安装目录下，找到 `Clink` 安装的位置。 

::: details 📁 Click 在哪里？
这个路径应该在 `软件包安装目录\clink\current\`  
`Clink` 具有管理软件包版本的功能，其使用 `current` 作为**软连接**，指向当前正在使用的版本。
:::

在这个文件夹中，你可以找到一个名为 `_default_settings` 的文件：
![默认设置](/fun/2024-12-4-cmd-prompt/clink-default-settings.webp)

删除文件名开头的 `_` ，再次重启 `cmd`。  
现在，你输入的内容将会被**高亮**显示！  

截至目前，我们的控制台仍然是光秃秃的 `Windows` 默认款式。  
好在 `Clink` 提供了几套主题！
```shell
# 列出所有已有的主题
clink config prompt list

# 预览主题的样子
clink config prompt show xxx 

# 使用一个主题
clink config theme use xxx
```
当然，还有更多的选择，比如 [这个仓库](https://github.com/chrisant996/clink-themes)！

### Unix 指令
对于热爱 Unix 系统的开发者来说，`Windows` 简直是一个噩梦。  
是时候从噩梦中苏醒了！

```shell
scoop install busybox gsudo vim btop bind openssl

# 下方的软件包，可能你已经通过其他方式配置过了，可以按需选择！
scoop install git openssh
```

::: tip 💡 提示
在开始阅读下方的解释之前，不妨试试这个！
```shell
scoop info 包名
```

它将会列举对应软件包的详细信息和相关链接，比俺下面解释的内容好多了！
:::

#### busybox
[`busybox`](https://www.busybox.net/) 负责提供绝大部分类 Unix 指令。  
有了它，你就可以使用 `ls`, `mv`, `rm`, `grep` 这些更熟悉的指令了！  

你可以直接输入 `busybox` 查看所有可用的指令。`Scoop` 已经帮你配好环境了。

#### gsudo
[`gsudo`](https://github.com/gerardog/gsudo) 是一个 `Windows` 的 `sudo` 实现。  
现在，你可以像 Unix 系统那样，使用 `sudo xxx` 以管理员权限执行指令了！

```shell
sudo 你要的指令

# 或者直接输入 sudo 进入管理员模式的 cmd
sudo 

# ...然后用 exit 退出！
exit
```

#### vim
[`vim`](https://www.vim.org/) 是非常好控制台文本编辑器。  
如果你对效率有非常高要求的话，用它！  

```shell
vim 文件名
```

#### btop
[`btop`](https://github.com/aristocratos/btop) 是一个酷炫的、运行在控制台的性能监视器。  
再也不用打开任务管理器去查看性能使用情况了！

```shell
btop
```

#### bind 与 openssl
[`bind`](https://www.isc.org/bind/) 与 [`openssl`](https://openssl-library.org/) 涉及到进阶的网络操作，可能常规使用会比较少。    
其中，比较出名的可能是 `bind` 提供的 `dig` 指令：

```shell
dig www.baidu.com
```

它可以用于检查 DNS 的解析情况！  

### 好玩的
指令未必总是有用的——他们也可以是好玩的！

```shell
scoop install neo-cowsay figlet

# 由于 windows 上并没有原 lolcat 的包，故使用一个 rust 的实现
# 这条指令需要提前配置好 rust ！
cargo install lolcat
```

这里的指令不再进行过多的解释，直接看效果吧！
```shell
figlet Hello! | cowsay

# 如果安装了 lolcat 的话
figlet Hello! | cowsay | lolcat
```

![lol!](/fun/2024-12-4-cmd-prompt/lolcat.webp)

## 后续步骤
截至目前，我们的 `cmd` 已经完全变换了相貌，变得能用甚至有些好用了！  
接下来，你可以探索更多的**主题**，或者**更好用的命令行工具**！  

俺将一些自己用着比较顺手的包列举在下面，以供参考：
```shell
# 添加 extras, java 和 nerd-font 的 bucket
scoop bucket add extras
scoop bucket add java
scoop bucket add nerd-fonts

# 一箩筐工具，按需安装！
scoop install 7zip bun clink-flex-prompt cmake docker ffmpeg imagemagick lua neovim ninja nvm pandoc pdftk perl typst xh
```

具体的使用方法，可以依次 `scoop info` 查看。没有安装也可以查询！  

## 结语
为什么本文所在的分类叫作 **行为艺术**？  

从本文来看：  
`cmd` 本身是一个被巨硬“半抛弃”的技术，本应当转向更为现代化的 `PowerShell`。  
然而，正如前半部分所述，出于种种特殊的需求和原因，俺选择放弃后者，并使用神奇的技巧将老旧的技术栈进行改造，让它变得**能用**甚至***好用***。  

这种*有一些技术含量*，*合理*，但让人感觉*南辕北辙*的做法，大概就是一种行为艺术吧。  
**希望各位看得开心！**  

**EOF**
