# 编辑器拓展快速入门

> 这篇文章原来打算叫 “策划看不懂代码，那咋整？”   
> 想想还是换一个吧（


## 1. 啥是编辑器拓展？

让我们想象自己是一个即将进行关卡搭建的策划。开发同学已经写好了相应的脚本，你只需要配置一下相应物体的参数，就能建立一个好玩的关卡了！
然而......

你为主角添加了 `Player` 这个组件。然后你看到了这些东西：
![图片](/unity/2023-10-24-editor-ext/1.avif)  

这些参数都是干啥用的?
你用高超的英语技巧推断了一下： 
- Speed → 速度
- Jump Height → 跳跃高度

但是Jump Buffer是个啥？跳跃缓冲器？
![图片](/unity/2023-10-24-editor-ext/2.avif)

Coyote Time 呢？丛林狼时间？
![图片](/unity/2023-10-24-editor-ext/3.avif)

哦豁，这下如果开发不在的话，这些参数就要一个个自己查、自己调试了，大大降低了游戏的开发效率。

那假如我掏出这个，阁下又该如何面对呢？
![图片](/unity/2023-10-24-editor-ext/4.avif)  

相比于之前的版本，现在的面板都使用中文作为标注，且按照一定的类别进行分类放置，看起来舒服多了；  
就算仍有些参数不能理解，也能大概猜出意思，进行调试也更加方便了！  

作为游戏开发，我们不仅仅需要关注逻辑代码是否通顺、是否高效，也应考虑到代码应当让不会写代码策划、美术同学们可以更容易地看得懂我们提供的工具，从而更好地交流协作。

显然，Unity不会良心到把中文都为我们准备好；
要实现上述的功能，我们需要对Unity进行一些小小的改动——编辑器拓展。


## 2. 你在编辑啥？

你打开了Unity，编写了 `MyComponent.cs` 文件，把他挂载到了一个空物体上。

```C#
using UnityEngine;

public class MyComponent : MonoBehaviour
{
    [SerializeField] private float speed;
}
```

你的组件看起来是这个样子的：
![图片](/unity/2023-10-24-editor-ext/5.avif)

然后你可以给Speed这个属性一个好看的值，比如5：
![图片](/unity/2023-10-24-editor-ext/6.avif)  

这个过程非常自然，你可以很方便地编辑这些值，然后在游戏里看到效果。  
但实际上，Unity在这中间替你做了非常多的事情。有哪些呢？
![图片](/unity/2023-10-24-editor-ext/7.avif)

在编辑器内，当你修改Inspector内的参数时，实际上修改的是序列化对象 `SerializedObject` 存储的值。
同时，我们可以通过拓展 `Editor` 和 `PropertyDrawer` 来实现自定义 Inspector 显示


## 3. 自定义 Editor

> 如果你只想要自定义PropertyDrawer的话，也不要跳过这一章，这底下会讲一些基础概念，且在PropertyDrawer那里不会重复的。  

当你拓展Editor时，你可以完全重写某一类型的物体在Inspector内的表现，而不影响其他类型的物体的表现。


### 3.1 先看看效果！

> 注意：所有对编辑器的拓展脚本（`using UnityEditor`）都需要放在任意位置下的Editor文件夹里！  
  
让我们创建一个Editor文件夹，然后在里面创建 `MyComponentEditor.cs`。  
接下来复制粘贴以下内容，看看会发生什么！
```C#
using UnityEngine;
using UnityEditor;

[CustomEditor(typeof(MyComponent))]
public class MyComponentEditor : Editor
{
    // Unity 在需要绘制面板的时候调用的回调方法，你需要在这里面编写代码以绘制控件
    public override void OnInspectorGUI()
    {
        // 画一行文字
        EditorGUILayout.LabelField("嗨害嗨！这是自定义的内容！");
        EditorGUILayout.Space();

        // 找到 serializedObject 对应的 serializedProperty，即 speed 属性
        var spd = serializedObject.FindProperty("speed");

        // 绘制属性编辑框
        EditorGUILayout.PropertyField(spd, new GUIContent("速度"));

        // 画个按钮
        if (GUILayout.Button("按我!"))
        {
            // 如果按钮被按下，就做出响应
            Debug.Log($"你设置的 speed 值为 {spd.floatValue}");
        }

        // 画个提示框
        EditorGUILayout.HelpBox("这是帮助框，里面可以写帮助信息", MessageType.Info);

        // 别忘了把更改保存到serializedObject哦！
        serializedObject.ApplyModifiedProperties();
    }
}
```  
> 你问我 `MyComponent` 是哪来的？看看第一节！

他的效果是这样的：
![图片](/unity/2023-10-24-editor-ext/8.avif)  

接下来，我们来分析一下上面那一段代码是如何工作的：

### 3.2 IMGUI 与 EditorGUILayout

IMGUI 是一个非常流行的GUI库。Unity将IMGUI的相关操作封装进了C#，供开发者更方便地绘制GUI。  

Unity已经提供了更现代化的GUI套件 UI ToolKit 以供UI绘制。这一套系统更加复杂，但是它实现了可视化的编辑器，并且支持更灵活地定制UI的样式、数据绑定等。  

> 考虑到项目实际应用上，IMGUI 已经能满足绝大多数需求，本文将继续使用 IMGUI。你也可以使用 UI ToolKit 实现类似的功能。

Unity总共提供了四个 IMGUI 的封装类：
- `UnityEngine.GUI`
- `UnityEngine.GUILayout`
- `UnityEditor.EditorGUI `
- `UnityEditor.EditorGUILayout`  

其中，`UnityEngine` 命名空间下的两个类在游戏内与编辑器拓展内均可调用，而 `UnityEditor` 下的两个类只能在编辑器拓展中使用。  

每一个类型都有大量的静态方法，负责绘制各种UI控件。

`GUI` 与 `GUILayout` 的区别在于：
- `GUI` 绘制UI的方法都需要你主动为其提供一个 Rect 对象，以表示这个UI所在的位置
-  `GUILayout` 绘制UI时会自动计算其位置。  

`EditorGUI` 与 `EditorGUILayout` 同理。  
继承 `Editor` 编写自定义绘制内容的时候，通常采用 `EditorGUILayout`。


### 3.3 代码解读

#### 3.3.1 基础控件

`EditorGUILayout.LabelField("嗨害嗨！这是自定义的内容！");`
这一行代码将会绘制一行文字，对应Inspector中的
![图片](/unity/2023-10-24-editor-ext/9.avif)

实际上，Unity提供了类型 `GUIContent` 对“要显示的文字”进行封装：  
```C#
EditorGUILayout.LabelField(
    new GUIContent("嗨害嗨！这是自定义的内容！", "这是这句话的ToolTip! ")
);
```  
  

这样，当鼠标移动到这句话上时，就会弹出 ToolTip 了：
![图片](/unity/2023-10-24-editor-ext/10.avif)  

`GUIContent` 也有一个包含 `Texture` 的构造函数。如果传入了一张图片，那么这张图片就会作为图标显示在文字的左侧。

类似地，`EditorGUILayout.HelpBox(string, MessageType)` 会绘制一个帮助框，如上方截图所示。


#### 3.3.2 按钮

```C#
if (GUILayout.Button("按我!"))
{
    // 如果按钮被按下，就做出响应
    Debug.Log($"你设置的 speed 值为 {spd.floatValue}");
}
```  

这几行代码要求Unity绘制一个按钮，并且在按下按钮的时候打印这句话。
这里有两个地方有一丢丢奇怪：
- 为啥使用的是 `GUILayout` 而不是 `EditorGUILayout` ？
- 为啥 `GUILayout.Button(string)` 的返回值可以表示【按钮是否被按下】？

第一个很好解释：`EditorGUILayout` 里根本没有封装 `Button` 方法！  
为啥？因为按钮也经常在游戏内使用，所以添加到 `GUILayout` 供玩家在游戏内添加显然是更好的选择

第二个需要解释一下：  
与直觉相悖的是， `OnInspectorGUI()` （什么，你问我这是啥？再仔细看看前面的内容！）的调用其实非常频繁。你的鼠标划过Inspector对应位置，Unity都需要检查一下：
- 你的鼠标有没有碰到按钮？
  - 有 → 将按钮变得高亮
  - 没有 → 将高亮的按钮变回原样（如果有的话）
- 其他类似的检测

当你的鼠标按下时，Unity会检查鼠标的位置是否在按钮内(以判定鼠标是否按了按钮)，并向 GUILayout.Button(string) 返回一个布尔值供用户判断。


#### 3.3.3 属性框

```C#
var spd = serializedObject.FindProperty("speed");
EditorGUILayout.PropertyField(spd, new GUIContent("速度"));
```  

在这两行代码中，我们找到了当前编辑的 `serializedObject` 的指定属性，以 `SerializedProperty` 类型实例的形式返回。  
> 都看到这里了，不妨复习一下前面的流程图？

##### 序列化属性 SerializedProperty  

`SerializedProperty` 依附于 `SerializedObject` 存在。

获取它的实例有两种方式：
- `serializedObject.FindProperty("属性路径（通常是名称）")`
- `serializedProperty.FindPropertyRelative("属性路径")`  
  

前者是获取目标 `SerializedObject` 的指定属性，后者是获取目标 `SerializedProperty` 的子属性。  

子属性是在 `SerializedObject` 嵌套的时候使用的概念。
例如，当一个物体（称为【obj】）成为另一个物体（称为【anotherObj】）的属性时，我们可以通过 `anotherObj.FindProperty("obj")` 找到这个物体（保存到【obj】变量），再通过 `obj.FindPropertyRelative("属性名称")` 获取到这个物体自身的属性

序列化属性是对所有类型的属性的抽象，它并不关心自己保存的值的类型。你可以通过这样一系列的C#接口（其实，在C#中，它们也称为【属性】，为了避免混淆才这么称呼的）来获取或写入它的实际值：  
![图片](/unity/2023-10-24-editor-ext/11.avif)  

> 哦当然，你自己心里肯定是清楚这个属性“实际上是什么类型的”，才调用对应的 xxxValue 的

##### PropertyField 与指定属性控件

EditorGUILayout.PropertyField这个方法将会让Unity自己去找合适的 PropertyDrawer 并绘制指定的 SerializedProperty；同时，在这个值被用户修改的时候自动保存到 SerializedProperty 去。

这个方法相对特殊，因为 EditorGUILayout 提供的其他控件使用起来会略微更复杂一丢丢：  
```C#
// 找到 serializedObject 对应的 serializedProperty，即 speed 属性
var spd = serializedObject.FindProperty("speed");

// 绘制属性编辑框
EditorGUILayout.PropertyField(spd, new GUIContent("速度"));

// 用指定的控件绘制，效果一模一样
spd.floatValue = EditorGUILayout.FloatField(new GUIContent("速度"), spd.floatValue);
```
![图片](/unity/2023-10-24-editor-ext/12.avif)

可以看到，我们使用了 `EditorGUILayout.FloatField` 绘制了一个一模一样的属性框。只不过，`EditorGUILayout.FloatField` 需要在绘制时给定一个数值，并且最终得到的结果不能自动更新到 `spd` 这个属性中去。  

换句话说，`EditorGUILayout.PropertyField` 这个方法使用起来更方便，可以自动寻找合适的控件绘制，并自动更新数值；其他控件的泛用性更强，它们可以从其他地方读取数值，或者实现更灵活的功能。


## 4. 自定义 PropertyDrawer

自定义 Editor 会改变某一类物体在Inspector面板中显示的样式，而自定义 PropertyDrawer 则会改变某一种属性显示的样式。

### 4.1 还是先看看效果！
为了避免干扰，如果你先完成了自定义 Editor里的内容，那么可以先把他删掉！  
在Editor文件夹下创建 FloatDrawer.cs，复制粘贴以下代码：
```C#
using UnityEngine;
using UnityEditor;

[CustomPropertyDrawer(typeof(float))]
public class FloatDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        EditorGUI.PropertyField(position, property, new GUIContent("速度"));
    }
}
```

编译后，看看 `MyComponent` 的面板怎么样了？
![图片](/unity/2023-10-24-editor-ext/13.avif)
干得好！


### 4.2 指定谁需要被自定义！

#### 4.2.1 指定一个类型

上述代码的第4行指定了应当被下方代码绘制的数据类型：
`[CustomPropertyDrawer(typeof(float))] `  
这告诉了 Unity：所有的 float 类型的属性都要按照我的规则绘制！

很好，相信聪明的你已经发现哪里不对劲了：
又不是只有 MyComponent 才有 float 类型的属性啊？
![图片](/unity/2023-10-24-editor-ext/14.avif)
哦豁，其他的组件遭殃了！

这并不是预期的功能：我们希望只为 MyComponent 的属性框改变标签。  
咋办呢？

#### 4.2.2 指定一个 Attribute

`Attribute` 本身是C#的语法特性，可以看看官方文档！

`[CustomPropertyDrawer(Type)]` 不仅可以接受一个特殊的类型，也可以接受一个 `Attribute。`  
如果指定了后者，那么Unity会筛选出所有 `具有这个Attribute` 的任意类型的属性 并按照规则绘制。

让我们编写这样一个 `Attribute` :
`TitleAttribute.cs` （它并不是编辑器拓展的一部分，不要放到Editor文件夹里）
```C#
using System;
using UnityEngine;

[AttributeUsage(AttributeTargets.Field, AllowMultiple = false)]
public class TitleAttribute : PropertyAttribute
{
    public string Label => label;
    private string label;

    public TitleAttribute(string label) { this.label = label; }
}
```  

可以观察到，这个 `Attribute` 本质上只接受一个 `string` 类型的变量，并保存在其中以供调用。

有了它，我们就可以改写先前的效果了：
删除 `FloatDrawer.cs` 并在同位置创建 `TitleDrawer.cs`，编写（复制粘贴）如下内容：
[CustomPropertyDrawer(typeof(TitleAttribute))]
```C#
public class TitleDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        label.text = ((TitleAttribute)attribute).Label;
        EditorGUI.PropertyField(position, property, label);
    }
}
```

修改 `MyComponent.cs` 成这样：
```C#
public class MyComponent : MonoBehaviour
{
    [SerializeField, Title("速度")] private float speed;
}
```
于是...
![图片](/unity/2023-10-24-editor-ext/15.avif)
好耶！

让我们再看看 `TitleDrawer` 的代码:  
在 `TitleDrawer.cs` 的 `OnGUI(Rect, SerializedProperty, GUIContent)` 回调中，相比于之前多了一行代码，是用来获取 TitleAttribute 里保存的字符串的：  
`label.text = ((TitleAttribute)attribute).Label;`

其中，`attribute` 是 `PropertyDrawer` 基类中提供的成员，它代表了当前正在被自定义绘制的`Attribute`  
将它转型成 `TitleAttribute` 就能读取我们想要的数据了！

### 4.3 Bigger, Better, Stronger！

截至目前，我们自定义的 `PropertyDrawer` 只能绘制一行内容。有没有办法让他绘制多行呢？
很简单：重写 `GetPropertyHeight(SerializedProperty, GUIContent)`
```C#
[CustomPropertyDrawer(typeof(TitleAttribute))]
public class TitleDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        label.text = ((TitleAttribute)attribute).Label;
        EditorGUI.PropertyField(position, property, label);
    }

    // 看这里！
    public override float GetPropertyHeight(SerializedProperty property, GUIContent label)
    {
        // 返回 单行行高*2 ！
        return EditorGUIUtility.singleLineHeight * 2;
    }
}
```
这样，Unity会为这个属性 留出两行的空间 ，供你绘制其他控件。  
要想在多出来的这两行绘制控件也很简单：创建一个新的 `Rect` 对象，使之的位置比 `OnGUI` 给出的 `position` 向下偏移一个 `EditorGUIUtility.singleLineHeight` 即可：

```C#
[CustomPropertyDrawer(typeof(TitleAttribute))]
public class TitleDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        label.text = ((TitleAttribute)attribute).Label;
        EditorGUI.PropertyField(position, property, label);
        
        // 复制一份 position。考虑到 position 之后也不会使用，这一步也可以省略，直接修改position的y值
        var newPos = new Rect(position);
        newPos.y += EditorGUIUtility.singleLineHeight;
        
        EditorGUI.LabelField(newPos, "这一行在下面！")
    }

    // 看这里！
    public override float GetPropertyHeight(SerializedProperty property, GUIContent label)
    {
        // 返回 单行行高*2 ！
        return EditorGUIUtility.singleLineHeight * 2;
    }
}
```


## 5. 应用：SceneName

在游戏搭建的过程中，策划往往需要配置【场景如何跳转】。
然而，万恶的Unity只能使用场景的名称，或者在 Build Settings 里的下标指定要加载的场景！
![图片](/unity/2023-10-24-editor-ext/16.avif)

那么，如果开发写一个【场景切换器】，他只能暴露一个 `string` 类型的变量，让策划找到场景的名字并填写进去。
这样容易出错！  
万一策划打错了一个字没有发现，那么就直接产生了一个bug！  
就算策划没有输入错误，那场景名称比较长时，搭建的效率也降低了。怎么办呢？

思路：拓展 `PropertyDrawer` ，使之将【需要输入场景名称的 string 属性输入框】绘制成一个 【选择器】 ，让策划选择场景而非输入名称。
```C#
[CustomPropertyDrawer(typeof(SceneNameAttribute))]
public class SceneNamePropertyDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        // 读取在 Build Settings 里添加过的所有场景的名称，保存为列表
        List<string> l = EditorBuildSettings.scenes.Select(i =>
        {
            var p = i.path.Split('/');
            return p[p.Length - 1].Split('.')[0];
        }).ToList();

        // 将列表中场景名称转换成 GUIContent
        var display = l.Select(i => new GUIContent(i)).ToList();
        
        // 提示策划，如果找不到想要的场景，可能是没有在 Build Settings 里添加
        display.Add(new GUIContent("找不到? 去BuildSettings添加对应场景"));

        // 绘制选择框 PopUp，并将前面得到的列表作为选项列表输入
        int sel = EditorGUI.Popup(position, label,
                            l.IndexOf(property.stringValue) == -1 ? 0 : l.IndexOf(property.stringValue),
                            display.ToArray());
        
        // 不让策划选择最后一个，即上面那一句提示
        property.stringValue = sel < l.Count ? l[sel] : l[0];
    }
}
```
他的效果：  
![图片](/unity/2023-10-24-editor-ext/17.avif)
好极了！


## 6. 写在最后
如果你是一个独立开发者，或者是一个大家都很懂技术的小团队，那么你或许会认为上方的内容“基本没有用”。  
这很正常——上述的内容是基于俺自己的团队合作经历总结而来的，也并非是一个普适性的结论。  

尽管如此，还是愿给你带来一些启发！