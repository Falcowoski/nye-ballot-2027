-- Initial data. Example listings are marked with "[Exemplo]" and should be
-- deactivated (is_active = false) once the real listings are in.

insert into public.participants (display_name, stay_days, is_confirmed, sort_order) values
  ('Gus', 7, true, 1),
  ('Ceci', 7, true, 2),
  ('Léo V', 7, true, 3),
  ('Léo F', 7, true, 4),
  ('My', 7, true, 5),
  ('Ed', 7, true, 6),
  ('Nati', 7, true, 7),
  ('Dudu', 2, true, 8),
  ('Pendente 1', 7, false, 9),
  ('Pendente 2', 7, false, 10);

insert into public.listings
  (name, location, airbnb_url, total_price, bedrooms, beds, bathrooms, beach_access, rating, review_count, note, suggested_by, photos, sort_order)
values
  (
    'Casa na beira do mar',
    'Ribeirão da Ilha, Florianópolis',
    'https://www.airbnb.com.br/rooms/20944841?check_in=2026-12-26&check_out=2027-01-02&adults=10',
    null, 3, 7, 2.5, 'Acesso direto ao mar', 4.66, 32, null, null,
    array[
      'https://a0.muscache.com/im/pictures/f4205fd5-c587-4e33-8acf-78aa90b02073.jpg?im_w=720',
      'https://a0.muscache.com/im/pictures/d0818b1d-3a9c-46f2-bd9f-609a9618b47c.jpg?im_w=720',
      'https://a0.muscache.com/im/pictures/b1bcbbc3-efd3-4b22-a6e6-c0a346329a8d.jpg?im_w=720',
      'https://a0.muscache.com/im/pictures/2814c96d-ef04-4121-ab3c-e606c5ee6da6.jpg?im_w=720',
      'https://a0.muscache.com/im/pictures/3634c821-d50a-497e-a2d5-b8054e3989d3.jpg?im_w=720',
      'https://a0.muscache.com/im/pictures/48b2421a-5abb-4dec-9082-cd9f6087313c.jpg?im_w=720',
      'https://a0.muscache.com/im/pictures/548cba8d-1d7a-471c-8cb6-f45c3a3d1e33.jpg?im_w=720',
      'https://a0.muscache.com/im/pictures/02fd9283-55a6-4d99-9724-56c24ebe149a.jpg?im_w=720'
    ],
    1
  ),
  (
    '[Exemplo] Casa da Lagoa',
    'Praia do Rosa, Imbituba',
    null, 14800, 5, 8, 3, '12 min a pé', null, null,
    'Casa de exemplo para testar a votação. Deck com vista pra lagoa e churrasqueira coberta.',
    (select id from public.participants where display_name = 'Léo F'),
    '{}', 2
  ),
  (
    '[Exemplo] Sobrado pé na areia',
    'Centro, Garopaba',
    null, 18900, 4, 6, 3, 'Pé na areia', null, null,
    'Casa de exemplo para testar a votação. Dá pra ver os fogos da sacada.',
    null, '{}', 3
  );
