
export class HumanBehaviorSimulator {
  constructor(page) {
    this.page = page;
    this.mousePosition = { x: 0, y: 0 };
  }

  async simulateHumanMovement() {
    // Случайные движения мыши с естественной траекторией
    const targetX = Math.random() * 1920;
    const targetY = Math.random() * 1080;
    
    await this.moveMouseNaturally(targetX, targetY);
    
    // Случайные паузы и микро-движения
    await this.randomPause(100, 500);
    
    // Иногда делаем "случайные" клики в пустых местах
    if (Math.random() < 0.1) {
      await this.page.mouse.click(targetX, targetY);
      await this.randomPause(200, 800);
    }
  }

  async moveMouseNaturally(targetX, targetY) {
    const steps = 10 + Math.floor(Math.random() * 10);
    const startX = this.mousePosition.x;
    const startY = this.mousePosition.y;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      // Добавляем кривизну к движению
      const curve = Math.sin(progress * Math.PI) * (Math.random() * 50 - 25);
      
      const x = startX + (targetX - startX) * progress + curve;
      const y = startY + (targetY - startY) * progress;
      
      await this.page.mouse.move(x, y);
      await this.randomPause(20, 80);
    }
    
    this.mousePosition = { x: targetX, y: targetY };
  }

  async typeWithMistakes(selector, text) {
    await this.page.focus(selector);
    
    for (let i = 0; i < text.length; i++) {
      // Иногда делаем опечатки
      if (Math.random() < 0.05 && i > 0) {
        const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        await this.page.keyboard.type(wrongChar);
        await this.randomPause(100, 300);
        await this.page.keyboard.press('Backspace');
        await this.randomPause(200, 500);
      }
      
      await this.page.keyboard.type(text[i]);
      await this.randomPause(80, 250);
    }
  }

  async humanScroll() {
    const scrollDirection = Math.random() > 0.5 ? 1 : -1;
    const scrollAmount = 100 + Math.random() * 300;
    const steps = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < steps; i++) {
      await this.page.mouse.wheel(0, scrollDirection * (scrollAmount / steps));
      await this.randomPause(50, 150);
    }
    
    // Иногда останавливаемся и "читаем"
    if (Math.random() < 0.3) {
      await this.randomPause(2000, 5000);
    }
  }

  async randomInteraction() {
    const actions = [
      () => this.simulateHumanMovement(),
      () => this.humanScroll(),
      () => this.page.keyboard.press('Tab'),
      () => this.simulatePageFocus(),
      () => this.simulateTextSelection()
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    await action();
  }

  async simulatePageFocus() {
    // Имитируем переключение вкладок
    await this.page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      setTimeout(() => {
        window.dispatchEvent(new Event('focus'));
      }, 100 + Math.random() * 500);
    });
  }

  async simulateTextSelection() {
    try {
      const textElements = await this.page.$$('p, span, div');
      if (textElements.length > 0) {
        const randomElement = textElements[Math.floor(Math.random() * textElements.length)];
        await randomElement.click({ clickCount: 2 }); // Двойной клик для выделения
        await this.randomPause(500, 1500);
        await this.page.keyboard.press('Escape'); // Снимаем выделение
      }
    } catch (error) {
      // Игнорируем ошибки
    }
  }

  async randomPause(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.page.waitForTimeout(delay);
  }

  async simulateReading() {
    // Имитируем чтение - случайные паузы и скроллинг
    const readingTime = 3000 + Math.random() * 10000;
    const endTime = Date.now() + readingTime;
    
    while (Date.now() < endTime) {
      await this.humanScroll();
      await this.randomPause(1000, 3000);
      
      // Иногда возвращаемся назад
      if (Math.random() < 0.2) {
        await this.page.mouse.wheel(0, -200);
        await this.randomPause(500, 1500);
      }
    }
  }
}
