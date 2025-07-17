import { promises as fs } from 'fs';
import path from 'path';

export default function viteSvgSprite(options = {}) {
  // Устанавливаем значения по умолчанию и переопределяем их переданными опциями
  const defaultOptions = {
    input: 'src/icons',         // Путь к исходным SVG-иконкам
    output: 'dist/assets',      // Путь для сохранения сгенерированного спрайта
    name: 'sprite.svg',         // Имя файла спрайта
  };

  const config = { ...defaultOptions, ...options };

  async function generateIconSprite() {
    // Формируем полные пути на основе переданных опций
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

    // Создаем SVG-спрайт из SVG-файлов
    for (const file of files) {
      if (!file.endsWith('.svg')) continue;
      let svgContent = await fs.readFile(path.join(iconsDir, file), 'utf8');
      const id = file.replace('.svg', '');
      svgContent = svgContent
        .replace(/id="[^"]+"/, '') // Удаляем любой существующий id
        .replace('<svg', `<symbol id="${id}"`) // Изменяем <svg> на <symbol>
        .replace('</svg>', '</symbol>');
      symbols += svgContent + '\n';
    }

    // Проверяем и создаем директорию для спрайта, если её нет
    await fs.mkdir(outputDir, { recursive: true });

    // Записываем SVG-спрайт в файл
    const sprite = `<svg>\n\n${symbols}</svg>`;
    await fs.writeFile(spriteFilePath, sprite);
    console.log(`[vite-svgsprite] SVG-спрайт создан: ${spriteFilePath}`);
  }

  return {
    name: 'vite-svgsprite', // Изменено имя плагина
    buildStart() {
      // Генерировать во время сборки
      return generateIconSprite();
    },
    configureServer(server) {
      // Восстанавливать во время разработки всякий раз, когда добавляется или изменяется иконка
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
