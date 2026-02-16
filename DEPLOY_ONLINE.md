# Deploy на Railway (рекомендуется)

**Railway** - лучший вариант для этого проекта (простой, дешевый, поддерживает WebSocket)

## 1️⃣ Подготовка к Deploy

### Шаг 1: Обновить package.json в backend
```bash
cd backend
```

Убедитесь, что в `package.json` есть поле `"engines"`:
```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node server-production.js",
    "dev": "nodemon server.js"
  }
}
```

### Шаг 2: Создать .env.production в backend
```
PORT=8080
NODE_ENV=production
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=...
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 2️⃣ Deploy Frontend на Vercel

### Опция A: Через веб-интерфейс

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Импортируйте GitHub репозиторий
4. Выберите `frontend` как root directory
5. Добавьте переменные окружения:
   ```
   NEXT_PUBLIC_API_URL=https://poker-backend-xxxxx.railway.app
   NEXT_PUBLIC_WS_URL=wss://poker-backend-xxxxx.railway.app
   ```
6. Deploy!

### Опция B: Через CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel deploy --prod
```

**Frontend будет доступен на**: `https://poker-game-xxxxx.vercel.app`

---

## 3️⃣ Deploy Backend на Railway

### Опция A: Через веб-интерфейс

1. Перейдите на [railway.app](https://railway.app)
2. Зарегистрируйтесь/логинитесь
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub"
5. Выберите ваш repo
6. Выберите ветку `main`
7. Railway автоматически обнаружит Node.js
8. Добавьте переменные окружения (см. выше)
9. Deploy!

### Опция B: Через Railway CLI

```bash
cd backend
npm install -g @railway/cli
railway login
railway link                    # Свяжитесь с проектом
railway variables set PORT 8080
railway deploy
```

**Backend будет доступен на**: `https://poker-backend-xxxxx.railway.app`

---

## 4️⃣ Deploy Smart Contract на Sepolia

### Шаг 1: Подготовка

```bash
cd contracts

# Установите зависимости если еще не установлены
npm install

# Обновите .env
cat > .env << EOF
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
EOF
```

### Шаг 2: Получить тестовый ETH

1. Перейдите на [Sepolia Faucet](https://sepoliafaucet.com)
2. Вставьте ваш адрес (начинается с 0x)
3. Получите тестовый ETH

### Шаг 3: Развернуть контракт

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Результат**:
```
PokerGame deployed to: 0x1234567890...
```

Скопируйте адрес и добавьте в:
- `.env.production` backend
- `frontend/.env.local`

---

## 5️⃣ Обновить фронтенд с новыми URLs

### Создайте `.env.production` в frontend

```
NEXT_PUBLIC_API_URL=https://poker-backend-xxxxx.railway.app
NEXT_PUBLIC_WS_URL=wss://poker-backend-xxxxx.railway.app
```

Переразверните на Vercel:
```bash
vercel deploy --prod
```

---

## ✅ Проверка Online

После deployment откройте:

1. **Фронтенд**: https://poker-game-xxxxx.vercel.app
2. **Health check**: https://poker-backend-xxxxx.railway.app/api/health
3. **API тест**: https://poker-backend-xxxxx.railway.app/api/lobbies

Должны получить:
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

---

## 🔧 Мониторинг

### Railway Dashboard
- https://railway.app/dashboard
- Просмотр логов
- Управление переменными
- Масштабирование ресурсов

### Vercel Dashboard
- https://vercel.com/dashboard
- Просмотр деплойментов
- Анализ производительности
- Edge function monitoring

---

## 📊 Стоимость (примерно)

| Сервис | Цена |
|--------|------|
| Railway (backend) | $5-20/месяц |
| Vercel (frontend) | Бесплатно - $20/месяц |
| Ethereum (Sepolia) | Бесплатно (тесты) |
| Mainnet | 💰💰💰 |
| **TOTAL** | **~$5-40/месяц** |

---

## 🚀 Масштабирование

Если нужно больше:

1. **Более мощный backend**:
   - Railway: увеличить CPU/RAM
   - Или перейти на AWS/GCP

2. **База данных**:
   - Railway: добавить PostgreSQL
   - MongoDB Atlas (free tier)

3. **Redis кэш**:
   - Railway: добавить Redis
   - Upstash Redis (free tier)

---

## 🐛 Проблемы при развертывании

### WebSocket не работает
- Проверьте что сервер использует `http.createServer()`
- Railway поддерживает WebSocket по умолчанию
- Используйте `wss://` (secure) вместо `ws://`

### CORS ошибки
- Проверьте `allowedOrigins` в backend
- Добавьте ваш Vercel URL
- Используйте `*` только для development

### Contract deployment failed
- Убедитесь что у вас есть тестовый ETH
- Проверьте INFURA_KEY
- Используйте sepolia сеть для тестов

---

## ✨ Готовые команды для развертывания

### Все разом (если используется монорепо):

```bash
# 1. Подготовка
cd poker-game
npm install-all

# 2. Frontend на Vercel
cd frontend && vercel deploy --prod

# 3. Backend на Railway (через веб)
# Или через CLI:
cd ../backend && railway deploy

# 4. Contract на Sepolia
cd ../contracts && npx hardhat run scripts/deploy.js --network sepolia
```

---

## 📝 Итоговая Configuration

### Backend Environment Variables
```
PORT=8080
NODE_ENV=production
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/...
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=...
FRONTEND_URL=https://poker-game-xxxxx.vercel.app
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://poker-backend-xxxxx.railway.app
NEXT_PUBLIC_WS_URL=wss://poker-backend-xxxxx.railway.app
```

### Contract Network Configuration
```
Network: Sepolia
RPC URL: https://sepolia.infura.io/v3/...
Chain ID: 11155111
```

---

## 🎉 Результат

После этого:
✅ Фронтенд работает на Vercel (fast, global CDN)
✅ Бекенд работает на Railway (reliable, 99.9% uptime)
✅ Контракт задеплоен на Sepolia (тестовая сеть)
✅ Все подключено и работает онлайн
✅ Готово для масштабирования

**Игра полностью онлайн и доступна всем! 🎰**
