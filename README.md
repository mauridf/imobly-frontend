
# Imobly Frontend - Sistema de Gestão de Locação de Imóveis

## 🎯 Visão Geral
O **Imobly Frontend** é uma aplicação web moderna desenvolvida em **React**, oferecendo uma interface intuitiva, responsiva e robusta para o gerenciamento completo de locação de imóveis. A aplicação consome a **Imobly API (.NET)** e entrega uma experiência profissional para gestão de propriedades residenciais e comerciais.

![Imobly Dashboard Preview](https://via.placeholder.com/800x400.png?text=Imobly+Dashboard+Preview)

---

## ✨ Funcionalidades Principais

### 📱 Interface Responsiva
- Design responsivo (Mobile, Tablet, Desktop)
- Tema claro e escuro
- Sidebar colapsável
- Loaders e skeletons para melhor UX

### 🔐 Sistema de Autenticação
- Login com JWT
- Registro de usuários
- Recuperação de senha
- Logout automático por inatividade
- Proteção de rotas privadas

### 🏠 Módulo de Imóveis
- Listagem com cards interativos
- Cadastro de imóveis residenciais e comerciais
- Upload múltiplo de imagens
- Filtros avançados
- Ativação/desativação de imóveis
- Visualização em galeria ou lista

### 👥 Gestão de Locatários
- Lista com status visual
- Validação de CPF em tempo real
- Histórico de contratos
- Busca avançada

### 📑 Contratos e Documentos
- Wizard de criação de contratos
- Associação imóvel/locatário
- Geração automática de recebimentos
- Download de contratos em PDF
- Histórico e reajustes

### 💰 Controle Financeiro
- Dashboard financeiro
- Status visual de recebimentos
- Gráficos de receitas e despesas
- Relatórios por período

### 🛠️ Manutenções e Seguros
- Calendário de manutenções
- Controle de status
- Gestão de seguros
- Alertas de vencimento

### 🔔 Notificações
- Notificações em tempo real (WebSocket)
- Alertas de vencimento
- Badge de notificações

### 📊 Dashboard Inteligente
- KPIs financeiros
- Gráficos interativos
- Contratos próximos do vencimento
- Atualização automática

---

## 🛠️ Tecnologias Utilizadas

### Core
- React 18
- TypeScript
- Vite
- React Router DOM v6

### UI/UX
- Material UI (MUI) v5
- Emotion
- React Hook Form
- Yup
- React Query (TanStack)
- Zustand

### Visualização
- Chart.js + React-Chartjs-2
- React Big Calendar
- React Data Table

### Utilitários
- Axios
- Date-fns
- React Hot Toast
- React Dropzone
- React PDF

### Ferramentas
- ESLint
- Prettier
- Husky
- Jest
- React Testing Library

---

## 📁 Estrutura do Projeto
```
imobly-frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Backend Imobly API
- Git

### Instalação
```bash
git clone https://github.com/seu-usuario/imobly-frontend.git
cd imobly-frontend
npm install
```

### Variáveis de Ambiente
```bash
cp .env.example .env.local
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000/ws
VITE_APP_NAME=Imobly
```

### Executar
```bash
npm run dev
```
Acesse: **http://localhost:5173**

---

## 🧪 Testes
```bash
npm run test
npm run test:coverage
```

---

## 🚢 Deploy

### Vercel (Recomendado)
- Conecte o repositório
- Configure variáveis de ambiente
- Deploy automático

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📈 Performance
- Code Splitting
- Lazy Loading
- Tree Shaking
- Lighthouse Score > 90
- Bundle < 500kb gzipped

---

## 📄 Licença
Licença MIT.

---

## 🤝 Contribuição
- Fork
- Branch feature/*
- Commits convencionais
- Pull Request

---

## 📞 Suporte
- GitHub Issues
- Wiki do projeto
- suporte@imobly.com

---

**Imobly Frontend** — gestão imobiliária moderna, rápida e profissional.
