Отлично, вот обновленный `README.md` на русском языке, с вашими новыми путями по умолчанию.

-----

# vite-svgsprite ✨

**Простой и эффективный Vite-плагин для автоматической генерации SVG-спрайтов.**

`vite-svgsprite` собирает ваши отдельные SVG-иконки в единый оптимизированный спрайт, повышая производительность и упрощая управление иконками в ваших Vite-проектах. Больше никаких лишних HTTP-запросов за каждой иконкой\!

-----

## 🚀 Установка

Установите плагин, используя npm или yarn: (НЕТ ЕГО ТАМ)

```bash
npm install ваш-пакет-vite-svgsprite-имя # Замените на ваше имя пакета
# или
yarn add ваш-пакет-vite-svgsprite-имя # Замените на ваше имя пакета
```

*(Примечание: Если вы используете этот код локально, не публикуя его как npm-пакет, просто скопируйте `vite-svgsprite.js` в папку `plugins` вашего проекта и импортируйте его оттуда.)*

-----

## 💡 Использование

### 1\. Добавьте плагин в ваш `vite.config.js`

Создайте файл `vite-svgsprite.js` (например, в папке `plugins/` вашего проекта) и вставьте в него код плагина:

```javascript
// plugins/vite-svgsprite.js
import { promises as fs } from 'fs';
import path from 'path';

export default function viteSvgSprite(options = {}) {
  // Новые пути по умолчанию
  const defaultOptions = {
    input: 'src/icons',      // Путь к исходным SVG-иконкам (от корня проекта)
    output: 'dist/assets',   // Путь для сохранения сгенерированного спрайта (от корня проекта)
    name: 'sprite.svg',      // Имя файла спрайта
  };

  const config = { ...defaultOptions, ...options };

  async function generateIconSprite() {
    const iconsDir = path.join(process.cwd(), config.input);
    const outputDir = path.join(process.cwd(), config.output);
    const spriteFilePath = path.join(outputDir, config.name);

    let files;
    try {
      files = await fs.readdir(iconsDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`[vite-svgsprite] Папка с иконками не найдена: ${iconsDir}. Спрайт не будет создан.`);
        return;
      }
      throw error;
    }

    let symbols = '';

    for (const file of files) {
      if (!file.endsWith('.svg')) continue;
      let svgContent = await fs.readFile(path.join(iconsDir, file), 'utf8');
      const id = file.replace('.svg', ''); // Имя файла становится ID символа
      svgContent = svgContent
        .replace(/id="[^"]+"/, '') // Удаляем любой существующий id
        .replace('<svg', `<symbol id="${id}"`) // Изменяем <svg> на <symbol>
        .replace('</svg>', '</symbol>');
      symbols += svgContent + '\n';
    }

    await fs.mkdir(outputDir, { recursive: true });
    const sprite = `<svg>\n\n${symbols}</svg>`;
    await fs.writeFile(spriteFilePath, sprite);
    console.log(`[vite-svgsprite] SVG-спрайт создан: ${spriteFilePath}`);
  }

  return {
    name: 'vite-svgsprite',
    buildStart() {
      return generateIconSprite();
    },
    configureServer(server) {
      const watcherPath = path.join(process.cwd(), config.input, '*.svg');
      server.watcher.add(watcherPath);
      server.watcher.on('change', async (changedPath) => {
        if (changedPath.endsWith('.svg')) {
          console.log(`[vite-svgsprite] Изменение SVG-файла: ${changedPath}. Пересоздаем спрайт.`);
          return generateIconSprite();
        }
      });
    },
  };
}
```

Теперь импортируйте и используйте его в вашем `vite.config.js`:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import viteSvgSprite from './plugins/vite-svgsprite.js'; // Убедитесь, что путь правильный

export default defineConfig({
  plugins: [
    viteSvgSprite({
      // Опциональные настройки:
      // input: 'src/assets/svg-icons', // Иконки будут читаться из `src/assets/svg-icons/`
      // output: 'public/images',       // Спрайт будет создан в корневой `public/` папке
      // name: 'my-custom-sprite.svg',  // Имя файла спрайта будет `my-custom-sprite.svg`
    }),
    // ...другие плагины
  ],
});
```

-----

### 2\. Разместите ваши SVG-иконки

Поместите ваши отдельные SVG-файлы в папку, указанную в опции **`input`** (по умолчанию **`src/icons`**).

Пример структуры проекта:

```
my-vite-project/
├── dist/
│   └── assets/
│       └── (здесь будет создан ваш спрайт во время сборки)
├── public/
│   └── (полезно для прямой отдачи статических файлов в режиме dev)
├── src/
│   ├── icons/
│   │   ├── home.svg
│   │   ├── settings.svg
│   │   └── user.svg
│   └── main.js
├── plugins/
│   └── vite-svgsprite.js
└── vite.config.js
```

-----

### 3\. Используйте иконки в вашем HTML/CSS

После запуска Vite (или сборки проекта) спрайт будет создан. Вы можете использовать иконки, ссылаясь на них с помощью элемента `<use>`:

Предположим, у вас есть иконка `home.svg` в вашей папке `input` и вы используете настройки по умолчанию (`output: 'dist/assets'`, `name: 'sprite.svg'`).

```html
<svg class="icon-24x24">
  <use href="/assets/sprite.svg#home"></use>
</svg>

<svg class="icon-small">
  <use href="/icons-bundle.svg#settings"></use>
</svg>

<style>
  .icon-24x24 {
    width: 24px;
    height: 24px;
    fill: currentColor; /* Позволяет управлять цветом с помощью CSS */
  }
  .icon-small {
    width: 16px;
    height: 16px;
    fill: blue;
  }
</style>
```

-----

## ⚙️ Опции

Вы можете передать объект опций плагину `viteSvgSprite()`:

| Опция  | Тип      | По умолчанию     | Описание                                                                  |
| :----- | :------- | :--------------- | :------------------------------------------------------------------------ |
| `input` | `string` | `'src/icons'`    | **Путь к папке, содержащей ваши исходные SVG-файлы**, относительно корня проекта. |
| `output`| `string` | `'dist/assets'`  | **Путь, куда будет сохранен сгенерированный спрайт**, относительно корня проекта. |
| `name`  | `string` | `'sprite.svg'`   | **Имя файла сгенерированного спрайта**.                                  |

-----

## ✨ Как это работает

Плагин выполняет следующие шаги:

1.  **Чтение SVG-файлов**: Сканирует указанную `input` папку на наличие `.svg` файлов.
2.  **Преобразование в символы**: Каждый `<svg>` тег внутри файла преобразуется в `<symbol>` с `id`, соответствующим имени файла (например, `home.svg` становится `<symbol id="home">`). Существующие `id` внутри SVG удаляются, чтобы избежать конфликтов.
3.  **Сборка спрайта**: Все `<symbol>` элементы объединяются в один корневой тег `<svg>`, создавая единый файл спрайта.
4.  **Сохранение спрайта**: Сгенерированный `sprite.svg` (или ваше кастомное имя) записывается в указанную `output` папку, создавая её при необходимости.
5.  **Горячее обновление**: Во время разработки плагин отслеживает изменения в SVG-файлах и мгновенно пересоздает спрайт, обеспечивая актуальность иконок без перезапуска сервера.

-----

## 🤝 Вклад

Приветствуются любые вклады\! Если у вас есть идеи по улучшению, отчеты об ошибках или предложения, пожалуйста, создавайте [Issue](https://www.google.com/search?q=https://github.com/your-username/vite-svgsprite/issues) или [Pull Request](https://www.google.com/search?q=https://github.com/your-username/vite-svgsprite/pulls) на GitHub.

-----

## 📄 Лицензия

Этот проект распространяется под лицензией MIT.

-----
