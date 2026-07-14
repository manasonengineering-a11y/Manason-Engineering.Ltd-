# Umutekano wa Admin — Ibyahinduwe (7 Nyakanga 2026)

## 1. Password nshya ya Admin — YIHUTIRWE
Password ya kera (`manason2026`) yakoreshwaga na buri wese yarakuweho burundu.
Password nshya y'agateganyo ni:

**Email/Phone:** manasonengineering@gmail.com (cyangwa +250785647676)
**Password:** `Manason@2026!`

➡️ **Injira ubu, ujye kuri Dashboard → Security → uhindure iyi password NONEAHA.**
Nimara guhindura password, andike neza kandi ntuyisangire na muntu wese.

## 2. Ibyakosowe (umutekano)
- Kuraho "backdoor" yaturaga umuntu uwo ari we wese yinjira nka Admin ata password nyakuri.
- Umuntu umwe gusa (Admin) ashobora kwinjira icyarimwe — niba winjiye ahandi, uwabanje
  arasohoka byikora.
- Dashboard isohoka (session irangira) nyuma y'amasaha 12, cyangwa iyo ufunze paji/tab.
- Amakuru y'ibanga (audit logs, ubutumwa/dispatches, Client Requests, backups) ntakiboneka
  na muntu utari Admin wemejwe — mbere byabonwaga na buri muntu wese wasuye urubuga!
- Password za buri muntu (Admin, abakiriya, abakozi) ntizikigaragara mu buryo bwa "plain text"
  binyuze muri API — mbere zari zigaragara zose.
- Ntawundi ushobora kwiyandikisha akihindura "Admin" (privilege escalation) — byari bishoboka
  mbere binyuze muri API itaziguye.
- Gusiba/guhindura konti y'undi muntu (`/api/users/:id`) ubu bisaba kuba winjiye nka Admin.

## 3. Icyakorwa kuri Render/GitHub
1. Fungura izi fayili zahinduwe muri iyi ZIP, uzishyire (replace) muri GitHub repo yawe:
   - `server.ts`
   - `src/types.ts`
   - `src/data/mockData.ts`
   - `src/components/AppContext.tsx`
   - `src/components/AuthModal.tsx`
   - `src/components/App.tsx` → (iri muri `src/App.tsx`)
   - `src/components/Dashboard.tsx`
2. Kohereza (push/commit) muri GitHub, Render izikora deploy nshya yo nyayo.
3. Nyuma y'uko deploy irangiye, injira, uhindure password nk'uko byavuzwe haruguru.

## 4. Icyitonderwa: Render Free Tier
Niba ukoresha "Free" tier ya Render nta "Persistent Disk", fayili ya `src/data/db.json`
(aho amakuru yose abikwa) **isibwa buri gihe seriveri igarutse (restart/redeploy)**.
Ibi bivuze ko na password nshya wahinduye ishobora gusubira kuri default nyuma y'uko
Render yongeye gutangira seriveri. Niba ubona iki kibazo, twagomba:
- Gushyiraho "Persistent Disk" kuri Render (biroherana n'amafaranga make), CYANGWA
- Kwimuka burundu ku bubiko bwa Supabase (aho amakuru azabikwa mu buryo buhoraho).
Ibi ni ikintu twagomba kuganiraho nyuma, keretse ubishaka nonaha.

## 5. Amakuru atazongera kubura (Persistent Storage) — BIKENEWE CYANE
Ubu, buri gihe hari impinduka (umukoresha mushya, akazi gashya, ifoto...), sisitemu **ibika
kopi muri Supabase** mu buryo bwikora. Nimara seriveri kongera gutangira (restart), **ibona
neza kopi ya nyuma muri Supabase mbere y'uko itangira kwakira abasuye urubuga**, aho gutangira
busa (nk'uko byari bimeze mbere).

**BISABA gukora aya rimwe gusa (ntakindi):**
1. Jya kuri Supabase Dashboard yawe → **SQL Editor**
2. Kanda **"New query"**, wandike/wshyiremo aya:
```sql
create table if not exists app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
```
3. Kanda **"Run"**
4. Emeza ko `SUPABASE_URL` na `SUPABASE_KEY` biri muri Environment Variables za Render (nk'uko
   twabivuze ku bijyanye na Storage bucket)

Nimara gukora ibi, amakuru yawe yose (abakoresha, akazi, ibicuruzwa, ibindi byose) azabikwa
burundu, ntazongera kubura na rimwe seriveri yongeye gutangira.

Iki gice cyakemuye Umutekano wa Admin (icya 1 ku rutonde rwawe). Ibindi (GPS/Email/WhatsApp
API, kwishyura kuri MoMo, guhindura numero ahantu hose, n'ibindi) turabikoraho mu byiciro
bikurikira.

## 6. GPS nyayo y'Umukozi (bishya)
Igihe umukiriya amaze gushyira amafaranga muri Escrow, sisitemu ihita yohereza ku mukozi
(binyuze kuri WhatsApp na SMS) **link ya GPS nyayo**. Umukozi ayifungura kuri telefoni ye,
akanda "Tangira Kohereza Aho Ndi", maze aho ari (GPS y'ukuri) bijya bigaragara ku ikarita ya
Admin na Client mu gihe cy'akazi (Escrow tab kuri Admin, "Hired Builders" kuri Client).

## 7. Kubika ID/Certificates by'abakozi (bikosowe)
Mbere, ibyangombwa (ID, Certificates) byabikwaga gusa ku seriveri ya Render, bikabura buri
gihe seriveri yongeye gutangira. Ubu, niba warashyizeho `SUPABASE_URL` na `SUPABASE_KEY` kuri
Render, ibyo byangombwa bibikwa muri **Supabase Storage** mu buryo buhoraho.

**Icy'ingenzi:** Kugira ngo ibi bikore, ugomba kubanza **kurema "bucket" muri Supabase**:
1. Jya kuri Supabase Dashboard yawe → **Storage**
2. Kanda **"New bucket"**, wite izina **`manason-uploads`**
3. Hindura "Public bucket" ku **ON** (kugira ngo amashusho/ID zigaragare ku rubuga)
4. Bika

Niba iyi bucket idahari cyangwa Supabase ntabwo yashyizweho, uploads zizakomeza gukora nk'uko
byahoze mbere (ku seriveri gusa, ntibihoraho) — nta kibazo kizabaho, ariko ntibizabikwa
burundu.

