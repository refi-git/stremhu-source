# StremHU Source elérése VPN-en keresztül

## Bevezető

Ha szeretnéd elérni a StremHU Source-ot távolról, de mégsem szeretnéd publikusan elérhetővé tenni bárhonnan az Internetről, használhatsz VPN-t is.

A megoldás lényege: **VPN (Virtual Private Network)** használata, amely titkosított kapcsolatot hoz létre az eszközeid között. Ez többféle módon megoldható, egyik lehetséges eszköz erre például a Tailscale.

**Előnyök:**

- Biztonságos hozzáférés otthoni hálózatodhoz bárhonnan
- Nem kell domain név és DDNS – Dynamic DNS
- Nem kell port forward-olás a routeren
- Nem kell reverse proxy
- Más eszközeidet/szolgáltatásaidat is elérheted távolról
- Csak azok az eszközök/felhasználók férnek hozzá, akiknek ezt engedélyezed a VPN-edben

---

## Előfeltétel

A StremHU Source legyen konfigurálva otthoni hálózatra [ezen útmutató](./stremhu-source-beuzemelese-otthon.md) alapján.

---

## Lehetséges megoldás: Tailscale subnet router

### Mi az a Tailscale?

A Tailscale egy egyszerűen használható VPN szolgáltatás, amely WireGuard technológiát használ. Személyes használatra ingyenes (max. 100 eszköz).

**Hivatalos oldal:** https://tailscale.com

### Mi az a subnet router?

A subnet router lehetővé teszi, hogy **több hálózatot összekapcsolj** a Tailscale-en keresztül. Az eszközök továbbra is elérhetőek az eredeti lokális IP-címükön (pl. `192.168.1.50`).

### Hogyan működik?

```
┌─────────────────────────────────────────────────────────┐
│                   Tailscale VPN hálózat                 │
│                  (titkosított tunnel)                   │
└─────────────────────────────────────────────────────────┘
           │                                   │
           │                                   │
   ┌───────▼──────────┐              ┌─────────▼────────┐
   │  Otthoni hálózat │              │  Külső hálózat   │
   │  (192.168.1.x)   │              │  (192.168.2.x)   │
   └──────────────────┘              └──────────────────┘
           │                                   │
    ┌──────┴─────┐                       ┌─────┴──────┐
    │ StremHU    │                       │ Eszközöd   │
    │ Szerver    │                       │ (telefon,  │
    │            │                       │  laptop)   │
    └────────────┘                       └────────────┘
```

**Eredmény:** Bárhol vagy, a Tailscale-en keresztül úgy éred el az otthoni StremHU szervert, mintha otthon lennél a hálózaton.

---

## Telepítési lépések

### 1. Tailscale fiók létrehozása

1. Látogass el a https://login.tailscale.com/start oldalra
2. Jelentkezz be Google, Microsoft, GitHub vagy email fiókkal
3. Ingyenes személyes használatra

---

### 2. Tailscale subnet router telepítése

A subnet router az otthoni hálózatodon fog futni. Tipikusan arra az eszközre telepíted, amin a StremHU Source is fut, de nem kötelező – elég, ha ugyanazon a hálózaton van.

**Ajánlott:** Olyan eszközre telepítsd, amely lehetőleg **folyamatosan elérhető** (0-24).

#### 2.1. Válaszd ki az operációs rendszert

- **Linux**
- **Windows**
- **Egyéb** lásd: https://tailscale.com/download

---

#### 2.2. Telepítés Linux-ra (Ubuntu/Debian)

**1. Tailscale telepítése:**

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

**2. Alhálózat meghatározása:**

Először derítsd ki, milyen IP tartományt használ az otthoni hálózatod:

```bash
ip addr show | grep inet
```

Keress egy sort, mint például: `inet 192.168.1.50/24`

Ez azt jelenti, hogy az alhálózatod: **192.168.1.0/24**

Gyakori értékek: `192.168.1.0/24`, `192.168.0.0/24`, `10.0.0.0/24`

**3. Tailscale indítása subnet router módban:**

```bash
# Cseréld ki a 192.168.1.0/24-et a saját alhálózatodra!
sudo tailscale up --advertise-routes=192.168.1.0/24 --accept-routes
```

A parancs megnyit egy böngésző ablakot a bejelentkezéshez. Ha nincs grafikus felület, másold az URL-t és nyisd meg egy másik gépen.

**4. IP forwarding engedélyezése:**

Ellenőrizd, hogy engedélyezve van-e:

```bash
sysctl -n net.ipv4.ip_forward
```

Ha `0`-t ad vissza, engedélyezd:

```bash
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
```

**Hivatalos Linux telepítési útmutató:** https://tailscale.com/kb/1031/install-linux

**Subnet router részletes dokumentáció:** https://tailscale.com/kb/1019/subnets

---

#### 2.3. Telepítés Windows-ra

**1. Tailscale telepítése:**

- Töltsd le: https://tailscale.com/download/windows
- Telepítsd és jelentkezz be a fiókkal

**2. Alhálózat meghatározása:**

Nyiss meg egy **Command Prompt** vagy **PowerShell** ablakot:

```powershell
ipconfig
```

Keress egy sort, mint: `IPv4 Address. . . . . . . . . . . : 192.168.1.50`  
Az alhálózat: **192.168.1.0/24**

**3. Subnet routing engedélyezése:**

Nyiss meg egy **PowerShell ablakot Rendszergazdaként** (Start → PowerShell → jobb klikk → Futtatás rendszergazdaként):

```powershell
# Cseréld ki a 192.168.1.0/24-et a saját alhálózatodra!
tailscale up --advertise-routes=192.168.1.0/24 --accept-routes
```

**Hivatalos Windows telepítési útmutató:** https://tailscale.com/kb/1022/install-windows

---

#### 2.4. Subnet útvonalak jóváhagyása

Miután telepítetted és elindítottad a Tailscale-t subnet router módban, jóvá kell hagyni az útvonalat a Tailscale admin felületen:

1. Látogass el a https://login.tailscale.com/admin/machines oldalra
2. Keresd meg az eszközödet a listában (pl. "server", "windows-pc", "macbook")
3. Kattints a **három pontra (⋮)** mellette → **Edit route settings**
4. **Kapcsold be** a subnet routes engedélyezését (pipáld be az alhálózatot)
5. Mentsd el

**Hivatalos útmutató képekkel:** https://tailscale.com/kb/1019/subnets (lásd "Step 3: Authorize the subnet routes")

**Fontos:** Amíg ezt nem teszed meg, a subnet routing nem fog működni!

---

### 3. Tailscale telepítése az eszközökre, amikről csatlakozni szeretnél

#### Opció A: Tailscale app telepítése

Ha az eszközön, amin a Stremio-t használod, telepíthető a Tailscale alkalmazás:

**Támogatott platformok:**

- Android / Android TV
- iOS
- macOS
- Windows
- Linux

**Telepítési linkek:** https://tailscale.com/download

**Telepítés lépései:**

1. Töltsd le és telepítsd a Tailscale alkalmazást az eszközödre
2. Nyisd meg az alkalmazást
3. Jelentkezz be **ugyanazzal a fiókkal**, mint amelyikkel a subnet routert konfiguráltad
4. Az eszköz automatikusan megjelenik a Tailscale hálózatodon
5. **Eszköz engedélyezése:** Az eszköz első csatlakozáskor automatikusan megjelenik a Tailscale hálózatodon. Ha a https://login.tailscale.com/admin/machines oldalon "Needs approval" státuszú, engedélyezd

**Fontos:** A Tailscale-nek **csatlakozva kell lennie** az eszközön, amikor a Stremio-t használod kívülről.

---

#### Opció B: Külső subnet router (ha nincs Tailscale app az eszközön)

Bizonyos eszközökön (pl. néhány Smart TV típus) nem telepíthető Tailscale alkalmazás.

**Megoldás:** Állíts be egy **második subnet routert** a külső hálózaton egy olyan eszközzel, amelyre telepíthető a Tailscale (laptop, mini PC, Raspberry Pi).

**Hogyan működik:**

```
┌──────────────────┐         Tailscale         ┌──────────────────┐
│ Otthoni hálózat  │◄──────────tunnel──────────►│ Külső hálózat    │
│  192.168.1.x     │                            │  192.168.2.x     │
└──────────────────┘                            └──────────────────┘
        │                                              │
  ┌─────┴──────┐                                 ┌─────┴──────┐
  │  StremHU   │                                 │   Eszköz   │
  │  szerver   │                                 │ (2. router)│
  └────────────┘                                 └─────┬──────┘
                                                       │
                                                 ┌─────┴──────┐
                                                 │   Eszköz   │
                                                 │ (nincs app)│
                                                 └────────────┘
```

**Telepítés:**

Kövesd ugyanazokat a lépéseket, mint a **2. Tailscale subnet router telepítése** fejezetben, de a külső hálózat IP tartományát add meg (pl. `192.168.2.0/24`). Ne felejtsd el jóváhagyni az útvonalat a Tailscale Admin Console-ban!

**Eredmény:** A külső hálózaton lévő **összes eszköz** (még azok is, amelyeken nincs Tailscale) elérik az otthoni hálózatodat.
