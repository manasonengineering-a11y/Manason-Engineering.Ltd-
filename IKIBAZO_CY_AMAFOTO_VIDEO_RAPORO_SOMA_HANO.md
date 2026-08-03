# Ikibazo cy'Amafoto/Video/Raporo bitagera neza — Isesengura n'Igisubizo

## 1. Impamvu nyakuri (root cause)

Iyo umukozi (worker) yohereje ifoto, video, cyangwa raporo (bikorwa muri "Upload Progress
Update" ku kazi kari `WORKING`), sisitemu ibanza kubika filo (photo/video) ku "storage" — mbere
yo kubika inzandiko (record) muri database.

Ikibazo ni iki: **niba `SUPABASE_URL` na `SUPABASE_KEY` bidashyizweho neza kuri Render, cyangwa
bucket `manason-uploads` idahari muri Supabase Storage**, filo (ifoto/video) zibikwa gusa ku
disk ya seriveri ya Render — kandi iyo disk **ntihoraho** (ephemeral): buri gihe seriveri
igarutse (restart, redeploy, cyangwa igasinziriye ikabyuka kuri free tier), filo zose zibikwa
hariya **zirasibwa burundu**. Ni yo mpamvu:

- Amafoto/video **ntibifunguka** nyuma y'igihe (link yabyo ntikiba ihari).
- Rimwe na rimwe **video ntiyigera rwose**, cyangwa igaragara nk'itariho.

Byongeye, muri code ya seriveri (`server.ts`), habagaho ikosa rindi: niba ifoto itaroherejwe
neza (urugero: umukozi yakanze "Ohereza Raporo" mbere y'uko ifoto irangiza kwoherezwa),
sisitemu yasimburaga ikibazo n'**ifoto y'agateganyo ivuye kuri internet** (stock photo) aho
kwerekana ikosa nyakuri — ni yo mpamvu "ifoto itariyo" yagaragaraga.

## 2. Ibyakosowe muri iyi ZIP

1. **`server.ts`** — Kuraho ifoto y'agateganyo (stock photo) yasimburaga ifoto nyayo. Ubu, niba
   nta foto yoherejwe, sisitemu ntizongera kwerekana ifoto itariyo — izakomeza kuba ubusa (nta
   foto), aho kubeshya.
2. **`src/components/Dashboard.tsx`** — Buto ya "Upload Report" ubu **irikinzwe (disabled)**
   igihe ifoto cyangwa video bikiri kwoherezwa, kugira ngo umukozi adakanda "Upload Report" mbere
   y'uko ibyo yashyizemo birangiza kohererezwa (ibyo ni byo byatumaga ifoto/video bibura muri
   raporo). Byongeye, ubutumwa buhabwa umukozi niba yibagiwe kwandika raporo (comment) mbere yo
   kohereza.

## 3. Icy'ingenzi kugira ngo amafoto/video/raporo bihore neza burundu (BIKENEWE CYANE)

Ibi bihinduka mu code ntibihagije uretse igihe hashyizweho Supabase Storage nk'uko bikurikira.
Niba utarabikora, jya kuri fayili `UMUTEKANO_WA_ADMIN_SOMA_HANO.md` (iri muri iyi ZIP nayo),
igice cya 5 na 7, ukurikize aya mabwiriza:

1. Kuri **Supabase Dashboard** yawe → **Storage** → kanda **"New bucket"** → wite izina
   **`manason-uploads`** (neza neza, uko byanditse) → shyira **"Public bucket"** kuri **ON** →
   Bika.
2. Emeza ko `SUPABASE_URL` na `SUPABASE_KEY` biri muri **Environment Variables** za Render
   (Render Dashboard → aho ari app yawe → Environment).
3. Nyuma yo gushyiraho bucket + environment variables, ongera ukore **deploy nshya** (redeploy)
   kuri Render kugira ngo impinduka zikurikizwe.

Nimara gukora ibi, amafoto/video/ID/raporo byose bizabikwa muri Supabase Storage burundu — ntabwo
bizongera gusibwa seriveri ya Render igarutse.

## 4. Uko wongera iyi ZIP kuri GitHub/Render

1. Fungura iyi ZIP, ufate fayili zahinduwe (`server.ts` na `src/components/Dashboard.tsx`),
   uzishyire (replace) muri GitHub repo yawe aho zisanzweho.
2. Kohereza (commit + push) muri GitHub.
3. Render izikora deploy nshya yo nyayo ikoreshe iyi mikorere mishya.
