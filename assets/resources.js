function bbcodeToHtml(bbcode) {
  // 定义 BBCode 转 HTML 的规则
  const rules = {
    "\\[br\\]": "<br>",
    "\\[b\\](.+?)\\[/b\\]": "<strong>$1</strong>",
    "\\[i\\](.+?)\\[/i\\]": "<em>$1</em>",
    "\\[u\\](.+?)\\[/u\\]": "<u>$1</u>",
    "\\[h1\\](.+?)\\[/h1\\]": "<h1>$1</h1>",
    "\\[h2\\](.+?)\\[/h2\\]": "<h2>$1</h2>",
    "\\[h3\\](.+?)\\[/h3\\]": "<h3>$1</h3>",
    "\\[h4\\](.+?)\\[/h4\\]": "<h4>$1</h4>",
    "\\[h5\\](.+?)\\[/h5\\]": "<h5>$1</h5>",
    "\\[QUOTE\\](.+?)\\[/QUOTE\\]": "<blockquote class='quoteContainer'>$1</blockquote>", 
    "\\[h6\\](.+?)\\[/h6\\]": "<h6>$1</h6>",
    "\\[p\\](.+?)\\[/p\\]": "<p>$1</p>",
    "\\[code\\](.+?)\\[/code\\]": "<pre>$1</pre>",
    "\\[color=(.+?)\\](.+?)\\[/color\\]": '<span style="color:$1">$2</span>',
    "\\[size=([0-9]+)\\](.+?)\\[/size\\]":
      '<span style="font-size:$1px">$2</span>',
    "\\[img\\](.+?)\\[/img\\]": '<img src="$1" class="bbCodeImage LbImage">',
    "\\[img=(.+?)\\]": '<img src="$1" class="bbCodeImage LbImage">',
    "\\[email\\](.+?)\\[/email\\]": '<a href="mailto:$1">$1</a>',
    "\\[email=(.+?)\\](.+?)\\[/email\\]": '<a href="mailto:$1">$2</a>',
    "\\[url\\](.+?)\\[/url\\]": '<a href="$1">$1</a>',
    "\\[url=(.+?)\\|onclick\\](.+?)\\[/url\\]": '<a onclick="$1">$2</a>',
    "\\[url=(.+?)\\starget=(.+?)\\](.+?)\\[/url\\]":
      '<a href="$1" target="$2">$3</a>',
    "\\[url=(.+?)\\](.+?)\\[/url\\]": '<a href=$1>$2</a>',
    "\\[a=(.+?)\\](.+?)\\[/a\\]": '<a href="$1" name="$1">$2</a>',
    "\\[list\\](.+?)\\[/list\\]": "<ul>$1</ul>",
    "\\n": "<br>",
    "\\[code\\](.+?)\\[/code\\]": (match, code) => {
      return `<pre><code>${code}</code></pre>`;
    },
    "\\[code=(.+?)\\](.+?)\\[/code\\]": `<pre><code>$1</code></pre>`,
    "\\[\\*\\](.+?)\\[/\\*\\]": "<li>$1</li>",
  };

  // 遍历规则并替换 BBCode 为 HTML
  for (const [regex, replacement] of Object.entries(rules)) {
    bbcode = bbcode.replace(new RegExp(regex, "gis"), replacement);
  }
  return bbcode;
}
function translateResource() {
  if (!!window.EventSource) {
    var source = new EventSource(
      "https://translate.spigotmc.tech/?id=" + window.location.hash.substring(1)
    );
    document.getElementById("resourceDescription").innerHTML = "";

    // 监听 message 事件
    source.onmessage = function (event) {
      // 判断是否返回了 "OK"，如果是则停止请求
      if (event.data === "OK") {
        source.close(); // 关闭事件源连接
        document.getElementById("resourceDescription").innerHTML = bbcodeToHtml(
          document.getElementById("resourceDescription").innerHTML
        );
        console.log("翻译结束");
      } else {
        // 否则继续显示数据
        var data = JSON.parse(event.data);
        document.getElementById("resourceDescription").innerHTML +=
          data.response;
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
    "https://spiget.spigotmc.tech/v2/resources/" +
    window.location.hash.substring(1);

  // Fetch data from the API
  fetch(apiUrl)
    .then((response) => response.json()) // 解析JSON响应
    .then((data) => {
      // 更新DOM元素
      document.getElementById("resourceTitle").innerText = data.name;
      document.getElementById("resourceTag").innerText = data.tag;
      document.getElementById("resourceDescription").innerHTML = atob(
        data.description
      );
      document.getElementById("resourceAuthor").innerText =
        "ID" + data.author.id; // 这里假设需要显示的是作者ID
      document.getElementById("resourceReleaseDate").innerText = new Date(
        data.releaseDate * 1000
      ).toLocaleString();
      document.getElementById("resourceUpdateDate").innerText = new Date(
        data.updateDate * 1000
      ).toLocaleString();
      document.getElementById("resourceDownloads").innerText = data.downloads;
      document.getElementById("resourcePrice").innerText = data.price
        ? `${data.price}元`
        : "免费";
      document.getElementById("toSpigotMC").href =
        "https://www.spigotmc.org/resources/" + data.id;
      document.getElementById(
        "downloadButton"
      ).href = `https://spiget.spigotmc.tech/v2/resources/${window.location.hash.substring(
        1
      )}/download`; // 假设这是下载链接的格式
    })
    .catch((error) => console.error("Error fetching data: ", error));
});

function updateimg() {
  // 获取所有需要处理的img标签
  const images = document.querySelectorAll(".bbCodeImage.LbImage");

  // 遍历每一个img标签
  images.forEach((img) => {
    // 从data-url属性获取URL
    const dataUrl = img.getAttribute("data-url");

    // 如果data-url存在，则更新src属性
    if (dataUrl) {
      img.setAttribute("src", dataUrl.replace("http://", "https://"));
    }
  });
}
