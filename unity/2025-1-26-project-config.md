# 运行时访问项目设置

> 我们编写了很多基础的功能，但还保留了一大部分，这样你才知道你用的是 ***Unity3D*** 

## TL;DR
- Unity 运行时无法访问自定义的 `ProjectSettings`
- 使用保存在 `Assets` 下的 `ScriptableObject` 作为自定义项目设置
- 使用 `Preloaded Assets` 和 `Resources.FindObjectOfTypeAll` 自动加载自定义设置项
- 使用 `IPreprocessBuildWithReport` 与 `IPostprocessBuildWithReport` 自动增删 `Preloaded Assets`


## 项目设置？

对 Unity 有些了解的朋友们都知道：Unity 提供了 `Project Settings` 窗口，可以在其中修改图像、物理碰撞等一系列与项目相关的配置。由 Unity 提供的这些设置项都可以在修改后直接作用在项目中。  

那么自然地，当我们跳出直接使用 `MonoBehaviour` 在 `Inspector` 界面编辑游戏内的各项数值这一比较原始的实践时，我们会想到通过自定义项目设置，来更方便地进行数值编辑与游戏行为配置操作。  

查阅相关文档，我们不难发现 Unity 确实提供了一整套方式：  

首先，在 `Project Settings` 窗口添加一项：
```C#
using UnityEditor;

[SettingsProvider]
public static SettingsProvider Configue()
    => new("菜单名称", SettingsScope.Project) 
    {
        label = "显示名称",
        guiHandler = (searchContext) => { /* 在这里编写自定义编辑器 */}
    }
```

然后，创建一个 `ScriptableObject` 单例，用于保存配置。  
Unity 贴心地给我们准备好了：
```C#
using UnityEditor;

[FilePath("ProjectSettings/保存位置", FilePathAttribute.Location.ProjectFolder)]
public class Settings : ScriptableSingleton<Settings>
{
    // 添加配置项
    [SerializeField] private int someSettings;

    private void OnDisable()
    {
        Save(true);
    }
}
```

很贴心对吧？很方便对吧？  
马上问题来了—— `ScriptableSingleton<T>` 在 `UnityEditor` 命名空间底下。  

What? 你不是“项目设置”吗？怎么真的要打包进项目了，你却打不进去？


## 存储位置

Unity 将所有的“项目设置”保存在项目根目录的 `ProjectSettings` 文件夹下。  

你马上就能反应过来：目前 Unity 提供的所有资源加载 API 均只能加载 `Assets` 下的资源，是无法直接访问到 `ProjectSettings` 的。 

但是不对啊，由 Unity 提供的设置项，比如 `Graphics`, `Physics` 之流，修改之后是可以对游戏运行时产生影响的，他一定存在某种读取措施。

如此酷炫的读取方式是什么呢？ `InternalEditorUtility.LoadSerializedFileAndForget()` 和 `InternalEditorUtility.SaveSerializedFileAndForget()`  
这俩看起来就不像是暴露给用户进行使用的。  

换言之，在运行时读取自定义存储在 `ProjectSettings` 文件夹内的 `ScriptableObject` 是基本不可能的。

聪明的你一定能想到：既然 `ProjectSettings` 文件夹不能用，那么将 `ScriptableObject` 置于 `Assets` 内，不就没问题了？  
没错！接下来，让我们研究如何优雅地将作为项目配置的 `ScriptableObject` 从 `Assets` 文件夹下加载出来。


## 优雅加载

即使看某 SDN 学习 Unity 的同学都知道，要动态地加载资源，只需要将目标放置在 `Assets` 下某个命名为 `Resources` 的文件夹，然后使用 `Resources.Load` 即可。  

对于绝大多数需求来说，这样做一点问题也没有；但对于“项目配置”来说，这样限制了配置文件的位置与加载方式。  
同时，我们注意到，Unity 官方提供的包，比如 `URP` 和 `InputManager`，可以将配置文件存储在任意位置。

![URP 的配置文件存储在根目录](/unity/2025-1-26-project-config/1.avif)

这是怎么做到的？  

查阅 `InputManager` 的源代码，可以找到他的初始化过程：
```C#
/** 
* InputSystem.cs
* com.unity.inputsystem@1.7.0
*/

#if UNITY_EDITOR

// 省略编辑器内的加载过程，主要是处理 Domain Reload 相关事项

#else

private static void InitializeInPlayer(IInputRuntime runtime = null, InputSettings settings = null)
{
    if (settings == null)
        settings = Resources.FindObjectsOfTypeAll<InputSettings>().FirstOrDefault() ?? ScriptableObject.CreateInstance<InputSettings>(); // [!code highlight]

    // No domain reloads in the player so we don't need to look for existing
    // instances.
    s_Manager = new InputManager();
    s_Manager.Initialize(runtime ?? NativeInputRuntime.instance, settings);

    // 省略其他初始化过程
}

#endif
```

`Resources.FindObjectsOfTypeAll()` 在文档里的解释如下：
> This function can return any type of Unity object that is loaded, including game objects, prefabs, materials, meshes, textures, etc. It will also list internal objects, therefore be careful with the way you handle the returned objects.

省流：`Resources.FindObjectsOfTypeAll()` 在 ***已加载*** 的资源中寻找相应类型的实例。  

::: warning
在编辑器运行的时候，资源无需提前加载，即可被 `Resources.FindObjectsOfTypeAll()` 获取。  
但是打包出去之后是获取不到的！  

千万不能信任在编辑器内运行的结果！
:::

考虑放置在任意位置，且没有启用 `Addressable` 等更高级的资源加载框架的情况下，`InputManager` 仍然能正确读取 `InputSettings`，即项目设置资源，那么聪明的你一定想到了：

存在某种 **自动加载资源** 的方式，在 `InputManager` 初始化之前已经将 `InputSettings` 加载了。  

如果你在将游戏打包时，仔细查阅过 `PlayerSettings` 里的各个项目的话，不难发现这个机制：
![Preloaded Assets](/unity/2025-1-26-project-config/2.avif)

`Preloaded Assets`! 只要将所有的配置文件加入其中，Unity 就会在启动时自动加载，进而被 `Resources.FindObjectsOfTypeAll()` 获取了！


## 构建管线

现在，我们还差最后一步：  
`Preloaded Assets` 虽好，但是手动将配置文件添加到列表中仍然是一个较为麻烦的操作。能否实现自动化？  

答案是**当然可以**！让我们继续摸着 `InputSystem` 过河：

```C#
/**
* InputSettingsBuildProvider.cs
* com.unity.inputsystem@1.7.0
*/

internal class InputSettingsBuildProvider : IPreprocessBuildWithReport, IPostprocessBuildWithReport
{
    public int callbackOrder => 0;

    public void OnPreprocessBuild(BuildReport report)
    {
        if (InputSystem.settings == null)
            return;

        // If we operate on temporary object instead of input setting asset,
        // adding temporary asset would result in preloadedAssets containing null object "{fileID: 0}".
        // Hence we ignore adding temporary objects to preloaded assets.
        if (!EditorUtility.IsPersistent(InputSystem.settings))
            return;

        // Add InputSettings object assets, if it's not in there already.
        var preloadedAssets = PlayerSettings.GetPreloadedAssets();
        if (!preloadedAssets.Contains(InputSystem.settings))
        {
            ArrayHelpers.Append(ref preloadedAssets, InputSystem.settings);
            PlayerSettings.SetPreloadedAssets(preloadedAssets);
        }
    }

    public void OnPostprocessBuild(BuildReport report)
    {
        // Revert back to original state by removing all input settings from preloaded assets.
        var preloadedAssets = PlayerSettings.GetPreloadedAssets();
        while (preloadedAssets != null && preloadedAssets.Length > 0)
        {
            var index = preloadedAssets.IndexOf(x => x is InputSettings);
            if (index != -1)
            {
                ArrayHelpers.EraseAt(ref preloadedAssets, index);
                PlayerSettings.SetPreloadedAssets(preloadedAssets);
            }
            else
                break;
        }
    }
}

```

这就是 Unity 给出的解决方案：
- 在构建开始前，将配置文件动态添加到 `Preloaded Assets` 中
- 在构建结束后，将配置文件从 `Preloaded Assets` 中移除

既然官方提供的实现如是，那么我们自己实现的时候不妨就服从吧！


## 总结

Unity 总是能够在“基础性的”功能上为你带来惊喜。这可能是由常年累月的、对旧代码和用户生态的妥协。  

好在，我们仍然可以摸着官方的石头过河，不是吗？  

::: tip 🥬 框架
[`Bingyan DevKit`](https://github.com/BingyanStudio/BingyanDevKit) 即将引入对此的支持！  
:::
