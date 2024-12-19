function bbcodeToHtml(bbcode) {
  // 定义 BBCode 转 HTML 的规则
  const rules = {
    "\\n": "<br>",
    "\\[b\\](.+?)\\[/b\\]": "<strong>$1</strong>",
    "\\[i\\](.+?)\\[/i\\]": "<em>$1</em>",
    "\\[u\\](.+?)\\[/u\\]": "<u>$1</u>",
    "\\[CENTER\\](.+?)\\[/CENTER\\]": "<div style='text-align: center;'>$1</div>",
    "\\[QUOTE\\](.+?)\\[/QUOTE\\]": "<blockquote class='quoteContainer'>$1</blockquote>",
    "\\[FONT=(.+?)\\](.+?)\\[/FONT\\]": "<span style=\"font-family: '$1'\">$2</span>", 
    "\\[color=(.+?)\\](.+?)\\[/color\\]": '<span style="color:$1">$2</span>',
    "\\[size=([0-9]+)\\](.+?)\\[/size\\]": '<font size="$1">$2</font>',
    "\\[RIGHT\\](.+?)\\[/RIGHT\\]": "<div style=\"text-align: right\">$1</div>",
    "\\[S\\](.+?)\\[/S\\]": "<strike>$1</strike>",
    "\\[INDENT\\](.+?)\\[/INDENT\\]": "<blockquote style=\"margin: 0 0 0 40px; border: none; padding: 0px;\">$1</blockquote>",
    "\\[code\\](.+?)\\[/code\\]": `<pre><code>$1</code></pre>`,
    "\\[code=(.+?)\\](.+?)\\[/code\\]": `<pre><code>$1</code></pre>`,
    "\\[html\\](.+?)\\[/html\\]": `<pre><code>$1</code></pre>`, //因为我懒得调用prism了
    "\\[php\\](.+?)\\[/php\\]": `<pre><code>$1</code></pre>`,//因为我懒得调用prism了
    "\\[img\\](.+?)\\[/img\\]": '<img src="$1" class="bbCodeImage LbImage">',
    "\\[img=(.+?)\\]": '<img src="$1" class="bbCodeImage LbImage">',
    "\\[url=(.+?)\\](.+?)\\[/url\\]": '<a href=$1>$2</a>',
    "\\[url\\](.+?)\\[/url\\]": '<a href="$1">$1</a>',
    
    "\\[list\\](.+?)\\[/list\\]": "<ul>$1</ul>",
    "\\[\\*\\](.+?)\\[/\\*\\]": "<li>$1</li>",
    "\\[\\SPOILER=(.+?)\\](.+?)\\[/\\SPOILER\\]": "$1（暂时无法实现折叠功能）$2",
    "\\[\\MEDIA=(.+?)\\](.+?)\\[/\\MEDIA\\]": "$1（暂时无法展示视频）$2",
    
    
    "\\[p\\](.+?)\\[/p\\]": "<p>$1</p>",
    "\\[email\\](.+?)\\[/email\\]": '<a href="mailto:$1">$1</a>',
    "\\[email=(.+?)\\](.+?)\\[/email\\]": '<a href="mailto:$1">$2</a>',
    "\\[url=(.+?)\\|onclick\\](.+?)\\[/url\\]": '<a onclick="$1">$2</a>',
    "\\[url=(.+?)\\starget=(.+?)\\](.+?)\\[/url\\]":
      '<a href="$1" target="$2">$3</a>',
    "\\[a=(.+?)\\](.+?)\\[/a\\]": '<a href="$1" name="$1">$2</a>',
    "\\[br\\]": "<br>",
    "\\[h1\\](.+?)\\[/h1\\]": "<h1>$1</h1>",
    "\\[h2\\](.+?)\\[/h2\\]": "<h2>$1</h2>",
    "\\[h3\\](.+?)\\[/h3\\]": "<h3>$1</h3>",
    "\\[h4\\](.+?)\\[/h4\\]": "<h4>$1</h4>",
    "\\[h5\\](.+?)\\[/h5\\]": "<h5>$1</h5>",
    "\\[h6\\](.+?)\\[/h6\\]": "<h6>$1</h6>",
  };
 //代码高亮
//[php]php[/php]
//[html]html[/html]
//[code=Java]java[/code]
//[code=Kotlin]kotlin[/code]
//[code=YAML]yaml[/code]
  // 遍历规则并替换 BBCode 为 HTML
  for (const [regex, replacement] of Object.entries(rules)) {
    bbcode = bbcode.replace(new RegExp(regex, "gi"), replacement);
  }
  return bbcode;
}
function translateResource() {
  if (!!window.EventSource) {
    let translatedata;
    var source = new EventSource(
      "https://translate.spigotmc.tech/?id=" + window.location.hash.substring(1)
    );
    document.getElementById("resourceDescription").innerHTML = "";
    translatedata = "";
    // 监听 message 事件
    source.onmessage = function (event) {
      // 判断是否返回了 "OK"，如果是则停止请求
      if (event.data === "OK") {
        source.close(); // 关闭事件源连接
        document.getElementById("resourceDescription").innerHTML = bbcodeToHtml(translatedata);
        console.log("翻译结束");
      } else {
        // 否则继续显示数据
        var data = JSON.parse(event.data);
        document.getElementById("resourceDescription").innerHTML +=
          data.response;
        translatedata += data.response;
        document.getElementById("resourceDescription").innerHTML = bbcodeToHtml(
          document.getElementById("resourceDescription").innerHTML
        );
      }
    };

    // 可选：监听 open 事件（连接打开）
    source.onopen = function () {
      console.log("翻译开始");
    };

    // 可选：监听 error 事件（发生错误）
    source.onerror = function (error) {
      console.error("EventSource failed.", error);
    };
  } else {
    document.getElementById("resourceDescription").innerHTML =
      "浏览器好像不支持翻译";
    console.error("浏览器好像不支持");
  }
}
function search() {
  window.location.href =
    "search.html#" + document.getElementById("search").value;
}

document.addEventListener("DOMContentLoaded", function () {
  // API endpoint
  const apiUrl =
    "https://api.spigotmc.tech/spigot/getResource.php?id=" +
    window.location.hash.substring(1);

  // Fetch data from the API
  fetch(apiUrl)
    .then((response) => response.json()) // 解析JSON响应
    .then((data) => {
      // 更新DOM元素
      document.getElementById("resourceTitle").innerText = data.title;
      document.getElementById("resourceTag").innerText = data.tag;
      document.getElementById("resourceDescription").innerHTML = bbcodeToHtml(
        data.description
      );
      document.getElementById("resourceAuthor").innerText = data.author.username; // 这里假设需要显示的是作者ID
      document.getElementById("resourceDownloads").innerText = data.stats.downloads;
      document.getElementById("resourcePrice").innerText = `${data.premium.price}元${data.premium.currency}`;
      document.getElementById("toSpigotMC").href =
        "https://www.spigotmc.org/resources/" + data.id;
      document.getElementById("downloadButton").href = data.external_download_url 
    ? data.external_download_url 
    : `https://spiget.spigotmc.tech/v2/resources/${window.location.hash.substring(1)}/download`;
    })
    .catch((error) => console.error("Error fetching data: ", error));
});
