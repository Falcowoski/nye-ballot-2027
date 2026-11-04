# nye-ballot-2027

Votação da casa do Airbnb para o Réveillon 2027. Cada pessoa escolhe um top 3 ranqueado; 1º vale 3 pontos, 2º vale 2 e 3º vale 1.

## Stack

- Vite 8, React 19, TypeScript 7, Tailwind 4 e componentes no estilo shadcn (Radix, vaul, embla, input-otp)
- Supabase: tabelas fechadas para a API pública; tudo passa pelas funções `check_password`, `get_ballot` e `cast_vote`, que conferem a senha do grupo (só o hash bcrypt fica no banco, dentro da função)
- Lint com oxlint (plugins unicorn, typescript, react, jsx-a11y, import)
- Deploy na Vercel

## Rodar local

```sh
npm install
npm run dev
```

## Dados

- `supabase/migrations/`: schema, regras de acesso e funções
- `supabase/seed.sql`: participantes e casas iniciais
- Valor por pessoa: total dividido pelas diárias-pessoa (`participants.stay_days`)
