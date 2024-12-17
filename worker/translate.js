export default {
  async fetch(request, env, ctx) {
    const encoder = new TextEncoder();

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing 'id' parameter", { status: 400 });
    }

    const resourceUrl = `https://api.spigotmc.org/simple/0.2/index.php?action=getResource&id=${id}`;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // 请求获取资源信息
          const resourceResponse = await fetch(resourceUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            },
          });

          if (!resourceResponse.ok) {
            const errorText = await resourceResponse.text();
            controller.enqueue(
              encoder.encode(
                `Failed to fetch resource: HTTP ${resourceResponse.status}\n${errorText}\n`
              )
            );
            controller.close();
            return;
          }

          const resourceData = await resourceResponse.json();
          const description = resourceData.description || "";

          if (!description) {
            controller.enqueue(encoder.encode("Description not found\n"));
            controller.close();
            return;
          }

          // 将 description 按每段 4000 字切分，即使最后一段小于 4000 字也处理
          const segments = [];
          for (let i = 0; i < description.length; i += 4000) {
            segments.push(description.slice(i, i + 4000));
          }

          // 逐段处理
          for (const [index, segment] of segments.entries()) {
            const messages = [
              {
                role: "system",
                content:
                  "You are a skilled translator capable of translating any language into Chinese. I will provide texts in different languages, and some of them may contain BBCode. Please ensure that the BBCode itself remains unchanged and is not translated. There is no need for any dialogue or explanation from you. Simply return the translated text as it is, without any additional commentary or modifications.",
              },
              {
                role: "user",
                content: `${segment}`,
              },
            ];

            // 调用 Cloudflare AI 服务
            const aiStream = await env.AI.run(
              "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
              {
                messages,
                stream: true,
              }
            );

            // 从 AI 的流中读取数据并逐步发送
            const reader = aiStream.getReader();
            let done = false;

            while (!done) {
              const { value, done: streamDone } = await reader.read();
              if (value) {
                controller.enqueue(value); // 将流式响应发送给客户端
              }
              done = streamDone;
            }
          }

          // 返回 OK，表示数据处理完成
          controller.enqueue(encoder.encode("data: OK\n\n"));
          controller.close(); // 处理完成，关闭流
        } catch (error) {
          controller.enqueue(encoder.encode(`Error: ${error.message}\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "content-type": "text/event-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  },
};
