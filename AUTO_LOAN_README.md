# 💳 Система расчета автокредита

## Описание

Функциональность для расчета автокредита с учетом законодательства Российской Федерации. Система позволяет пользователям:

1. **Выбрать модель автомобиля** из каталога
2. **Рассчитать платежи** по кредиту:
   - Сумма кредита
   - Первоначальный взнос (10-100%)
   - Срок кредита (24-72 месяца)
   - Процентная ставка (5-30%)
3. **Просмотреть результаты**:
   - Ежемесячный платеж
   - Переплата по процентам
   - Итоговая сумма к оплате
   - График погашения (первые 12 месяцев)
4. **Подать заявку** на кредит с контактными данными

## Структура компонентов

### AutoLoanModal.vue

Модальное окно для выбора автомобиля и открытия калькулятора.

**Props:**

- `show: boolean` - видимость модального окна

**Events:**

- `update:show` - обновление видимости окна

### AutoLoanCalculator.vue

Компонент калькулятора с расчетом платежей по законам РФ.

**Props:**

- `modelId: string` - ID выбранной модели

**Events:**

- `close` - закрытие модального окна после отправки заявки

### AppHeader.vue

Заголовок приложения с кнопкой "💳 Кредит" (видна на экранах sm и выше).

## Интеграция с API

Сервис `auto-loan.service.ts` предоставляет метод:

```typescript
submitAutoLoanApplication(data: AutoLoanApplicationRequest): Promise<AutoLoanApplicationResponse>
```

Параметры:

```typescript
interface AutoLoanApplicationRequest {
  modelId: string; // ID модели автомобиля
  carPrice: number; // Стоимость автомобиля в рублях
  downPaymentPercent: number; // Первоначальный взнос в %
  loanTermMonths: number; // Срок кредита в месяцах
  annualInterestRate: number; // Годовая процентная ставка
  firstName: string; // Имя заявителя
  lastName: string; // Фамилия заявителя
  phone: string; // Номер телефона
  email: string; // Электронная почта
}
```

## Расчеты по законодательству РФ

### Формула расчета ежемесячного платежа

Используется формула аннуитетного платежа (стандарт для РФ):

$$A = P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}$$

Где:

- **A** - ежемесячный платеж
- **P** - сумма кредита
- **r** - месячная процентная ставка (годовая / 100 / 12)
- **n** - количество месяцев

### Обязательное страхование

- Добавляется автоматически (~8% в год)
- Распределяется на весь срок кредита
- Приблизительный расчет общей суммы к оплате

### Ставка UFMR (Uniform Finance Margin Rate)

- Рассчитывается на основе ставки рефинансирования ЦБ РФ
- Предельная ставка = ставка ЦБ + 5-7%
- По умолчанию ставка ЦБ установлена в 18%

## Использование в компонентах

```vue
<script setup>
import { ref } from "vue";
import AutoLoanModal from "@/components/auto-loan/AutoLoanModal.vue";

const isAutoLoanOpen = ref(false);
</script>

<template>
  <button @click="isAutoLoanOpen = true">💳 Рассчитать кредит</button>

  <AutoLoanModal v-model:show="isAutoLoanOpen" />
</template>
```

## Хранилище Pinia

Store `useAutoLoanStore` предоставляет:

```typescript
// State
applications: AutoLoanApplication[]  // История заявок
isLoading: boolean                   // Статус загрузки

// Getters
getApplicationById(id: string)        // Получить заявку по ID

// Actions
addApplication(application)           // Добавить новую заявку
updateApplication(id, updates)        // Обновить заявку
```

## Дизайн

- Использует Tailwind CSS
- Адаптивный дизайн для мобильных и десктопных устройств
- Поддержка светлой/темной темы
- Анимированные переходы и эффекты

## Кнопка в хедере

Зеленая кнопка "💳 Кредит" отображается:

- На экранах `sm` (640px) и выше
- Рядом с кнопкой "Тест-драйв"
- С анимацией при наведении

На мобильных устройствах кнопка скрывается из-за ограничения пространства.

## Файловая структура

```
src/
  components/
    auto-loan/
      AutoLoanModal.vue         # Модальное окно
      AutoLoanCalculator.vue    # Калькулятор
    app-header/
      AppHeader.vue             # Заголовок с кнопкой
  services/
    auto-loan.service.ts        # API сервис
  stores/
    auto-loan.store.ts          # Pinia store
```
