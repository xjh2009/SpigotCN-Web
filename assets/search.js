function search() {
	window.location.href = 'search.html#' + document.getElementById('search').value;
	location.reload();
}
document.addEventListener("DOMContentLoaded", function() { // API endpoint
	const apiUrl = 'https://spiget.spigotmc.tech/v2/search/resources/' + window.location.hash.substring(1);

	// Fetch data from the API
	fetch(apiUrl)
		.then(response => response.json()) // 解析JSON响应
		.then(data => {
			// 去重后的数据处理
			const uniqueData = [...new Map(data.map(item => [item['id'], item])).values()];

			// 获取要插入内容的section
			const section = document.getElementById('data1');

			// 清空section中的现有内容
			section.innerHTML = '';

			// 遍历每个项目并创建卡片
			uniqueData.forEach(item => {
				// 创建 a 标签
				const link = document.createElement('a');
				link.href = 'resources.html#' + item.id; // 假设 item 对象中有 url 属性
				link.className = 'card-link'; // 可以根据需要添加类名

				// 创建 article
				const article = document.createElement('article');
				article.className = 'card bg-dark text-white mb-3';

				// 创建 card-body
				const cardBody = document.createElement('div');
				cardBody.className = 'card-body';

				// 创建标题
				const title = document.createElement('h5');
				title.className = 'card-title';
				if (item.premium) {
					title.innerHTML = item.name + '<span class="badge bg-secondary">付费资源</span>';
				} else {
					title.textContent = item.name;
				}

				// 创建标签
				const tag = document.createElement('p');
				tag.className = 'card-text';
				tag.textContent = item.tag;

				// 将标题和标签添加到 card-body
				cardBody.appendChild(title);
				cardBody.appendChild(tag);

				// 将 card-body 添加到 article
				article.appendChild(cardBody);

				// 将 article 添加到 a 标签
				link.appendChild(article);

				// 将 a 标签添加到 section
				section.appendChild(link);
			});
		})
		.catch(error => console.error('Error fetching data: ', error));
});