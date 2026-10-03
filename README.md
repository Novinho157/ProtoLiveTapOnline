# Protótipo Live Tap — online

Este projeto é um **ambiente de teste**. Ele simula espectadores virtuais e seus taps em um servidor próprio. Não possui integração com TikTok, nem envia curtidas/taps para plataformas externas.

## Rodar no PC

1. Instale o Node.js.
2. Abra um terminal nesta pasta.
3. Execute:
   `npm install`
4. Depois:
   `npm start`
5. Abra:
   `http://localhost:3000`

## Colocar online

O projeto pode ser hospedado em qualquer serviço que execute Node.js e aceite WebSocket.

Defina a variável de ambiente `PORT` se o provedor fornecer uma porta própria.

Depois de publicado, abra o endereço HTTPS fornecido pelo provedor. O navegador usará `wss://` automaticamente.

## Teste

- Escolha a quantidade de espectadores.
- Escolha a média de taps/s por pessoa.
- Clique em **Aplicar**.
- Clique em **Iniciar**.
- O servidor simula cada espectador separadamente.
- Abra o endereço em outro navegador/dispositivo para ver o mesmo painel em tempo real.

Limite padrão: 5.000 espectadores virtuais e 500 linhas exibidas no painel.

## Próxima etapa

Quando seu aplicativo existir, a API de teste pode ser adaptada para receber os eventos do seu próprio app.
