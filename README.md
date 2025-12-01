# 🧠 Habit Tracker

O **Habit Tracker** é um aplicativo para ajudar pessoas a **criar e manter hábitos diários** de forma simples e organizada.  
O foco é melhorar a **disciplina, produtividade e bem-estar** do usuário.

---

## 🚀 Funcionalidades

- Criar hábitos personalizados  
- Marcar hábitos concluídos (checklist)  
- Ver estatísticas e gráficos de progresso  
- Receber notificações automáticas  

---

## ⚙️ Requisitos

**Funcionais**
- Cadastro e edição de hábitos  
- Registro diário de conclusão  
- Exibição de progresso e lembretes  

**Não Funcionais**
- Interface simples e responsiva  
- Carregamento rápido (< 2s)  
- Dados protegidos e sincronizados em nuvem  

---

## 💡 Tecnologias

- **Front-end:** React Native / Expo  
- **Back-end:** Firebase e typescript
- **Banco de dados:** Firestore  

---
## ⚙️ Como Executar o Projeto
# 📌 Pré-requisitos

  -**Node.js** (v16 ou superior)
  -**npm** ou **yarn**
  -**Expo CLI**
  -**Conta no Firebase (para backend)**

## 🚀 Passo 1: Clonar o Repositório
git clone https://github.com/seu-usuario/habit-tracker.git
cd habit-tracker

## 📦 Passo 2: Instalar Dependências
npm install
# ou
yarn install

## 🔥 Passo 3: Configurar Firebase

Crie um projeto no Firebase Console.
Ative:

  -Authentication (Email/Password)
  -Firestore

Baixe o arquivo google-services.json (para Android)
ou adicione manualmente as configurações no arquivo firebase.ts.

# Configure as regras de segurança do Firestore (fornecidas no código do projeto).

## ▶️ Passo 4: Iniciar o Aplicativo
npx expo start

📱 Passo 5: Executar em um Dispositivo

Abra o app Expo Go (iOS/Android)
Escaneie o QR Code exibido no terminal ou no navegador após iniciar o Expo
